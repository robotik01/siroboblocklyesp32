#!/usr/bin/env python3
"""
PlatformIO Compiler API Server
Menerima file C++/H, compile dengan PlatformIO, dan mengembalikan file HEX/BIN
"""

import os
import uuid
import shutil
import asyncio
import subprocess
import tempfile
from pathlib import Path
from typing import Optional, List
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import aiofiles

# Configuration
UPLOAD_DIR = Path("/tmp/pio_compiler")
UPLOAD_DIR.mkdir(exist_ok=True)

# PlatformIO executable path
PIO_PATH = os.path.expanduser("~/.local/bin/pio")

app = FastAPI(
    title="PlatformIO Compiler API",
    description="API untuk compile program C++/H menjadi file HEX/BIN",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supported boards configuration
SUPPORTED_BOARDS = {
    # Arduino AVR
    "uno": {"platform": "atmelavr", "board": "uno", "framework": "arduino"},
    "nano": {"platform": "atmelavr", "board": "nanoatmega328", "framework": "arduino"},
    "mega": {"platform": "atmelavr", "board": "megaatmega2560", "framework": "arduino"},
    "leonardo": {"platform": "atmelavr", "board": "leonardo", "framework": "arduino"},
    "micro": {"platform": "atmelavr", "board": "micro", "framework": "arduino"},
    "promini": {"platform": "atmelavr", "board": "pro8MHzatmega328", "framework": "arduino"},
    
    # ESP32
    "esp32": {"platform": "espressif32", "board": "esp32dev", "framework": "arduino"},
    "esp32s2": {"platform": "espressif32", "board": "esp32-s2-saola-1", "framework": "arduino"},
    "esp32s3": {"platform": "espressif32", "board": "esp32-s3-devkitc-1", "framework": "arduino"},
    "esp32c3": {"platform": "espressif32", "board": "esp32-c3-devkitm-1", "framework": "arduino"},
    
    # ESP8266
    "esp8266": {"platform": "espressif8266", "board": "esp12e", "framework": "arduino"},
    "nodemcu": {"platform": "espressif8266", "board": "nodemcuv2", "framework": "arduino"},
    "d1mini": {"platform": "espressif8266", "board": "d1_mini", "framework": "arduino"},
    "wemos": {"platform": "espressif8266", "board": "d1_mini", "framework": "arduino"},
    
    # STM32
    "bluepill": {"platform": "ststm32", "board": "bluepill_f103c8", "framework": "arduino"},
    "blackpill": {"platform": "ststm32", "board": "blackpill_f401cc", "framework": "arduino"},
    "stm32f103": {"platform": "ststm32", "board": "genericSTM32F103C8", "framework": "arduino"},
    "stm32f401": {"platform": "ststm32", "board": "genericSTM32F401CC", "framework": "arduino"},
    
    # Teensy
    "teensy40": {"platform": "teensy", "board": "teensy40", "framework": "arduino"},
    "teensy41": {"platform": "teensy", "board": "teensy41", "framework": "arduino"},
    "teensy32": {"platform": "teensy", "board": "teensy31", "framework": "arduino"},
    
    # ATmega
    "atmega328p": {"platform": "atmelavr", "board": "ATmega328P", "framework": "arduino"},
    "atmega2560": {"platform": "atmelavr", "board": "megaatmega2560", "framework": "arduino"},
}


class CompileRequest(BaseModel):
    board: str
    code: str
    libraries: Optional[List[str]] = []
    build_flags: Optional[List[str]] = []


class CompileResponse(BaseModel):
    success: bool
    message: str
    job_id: Optional[str] = None
    output: Optional[str] = None
    errors: Optional[str] = None
    firmware_url: Optional[str] = None
    firmware_size: Optional[int] = None


def create_platformio_ini(project_dir: Path, board_config: dict, libraries: List[str] = [], build_flags: List[str] = []):
    """Create platformio.ini file for the project"""
    ini_content = f"""[env:target]
platform = {board_config['platform']}
board = {board_config['board']}
framework = {board_config['framework']}
"""
    
    if libraries:
        lib_deps = "\n    ".join(libraries)
        ini_content += f"""
lib_deps = 
    {lib_deps}
"""
    
    if build_flags:
        flags = "\n    ".join(build_flags)
        ini_content += f"""
build_flags = 
    {flags}
"""
    
    (project_dir / "platformio.ini").write_text(ini_content)


def run_pio_compile(project_dir: Path) -> tuple:
    """Run PlatformIO compile and return (success, stdout, stderr)"""
    try:
        result = subprocess.run(
            [PIO_PATH, "run", "-d", str(project_dir)],
            capture_output=True,
            text=True,
            timeout=300  # 5 minutes timeout
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return False, "", "Compile timeout (exceeded 5 minutes)"
    except Exception as e:
        return False, "", str(e)


def find_firmware_file(project_dir: Path) -> Optional[Path]:
    """Find the compiled firmware file (.hex, .bin, or .elf)"""
    build_dir = project_dir / ".pio" / "build" / "target"
    
    if not build_dir.exists():
        return None
    
    # Look for firmware files in order of preference
    for ext in [".hex", ".bin", ".elf"]:
        for firmware_file in build_dir.glob(f"firmware{ext}"):
            return firmware_file
    
    # Also check for any hex/bin files
    for ext in [".hex", ".bin"]:
        files = list(build_dir.glob(f"*{ext}"))
        if files:
            return files[0]
    
    return None


def cleanup_project(project_dir: Path):
    """Clean up project directory after some time"""
    try:
        if project_dir.exists():
            shutil.rmtree(project_dir)
    except Exception:
        pass


@app.get("/")
async def root():
    """Root endpoint with API info"""
    import socket
    hostname = socket.gethostname()
    try:
        local_ip = socket.gethostbyname(hostname)
    except:
        local_ip = "unknown"
    
    return {
        "name": "PlatformIO Compiler API",
        "version": "1.0.0",
        "server": {
            "hostname": hostname,
            "ip": local_ip,
            "access_url": f"http://{local_ip}:8080"
        },
        "endpoints": {
            "GET /": "API info and server details",
            "GET /health": "Health check",
            "GET /boards": "List all supported boards",
            "GET /platforms": "List installed platforms",
            "POST /compile": "Compile code (JSON body)",
            "POST /compile/upload": "Compile uploaded files",
            "GET /download/{job_id}": "Download compiled firmware",
            "GET /status/{job_id}": "Check compilation status",
            "DELETE /cleanup/{job_id}": "Clean up job files"
        },
        "docs": {
            "swagger_ui": "/docs",
            "redoc": "/redoc"
        }
    }


@app.get("/boards")
async def list_boards():
    """List all supported boards"""
    return {
        "boards": list(SUPPORTED_BOARDS.keys()),
        "details": SUPPORTED_BOARDS
    }


@app.get("/platforms")
async def list_platforms():
    """List installed PlatformIO platforms"""
    try:
        result = subprocess.run(
            [PIO_PATH, "pkg", "list", "-g", "--only-platforms"],
            capture_output=True,
            text=True
        )
        return {"platforms": result.stdout, "success": True}
    except Exception as e:
        return {"platforms": "", "success": False, "error": str(e)}


@app.post("/compile", response_model=CompileResponse)
async def compile_code(request: CompileRequest, background_tasks: BackgroundTasks):
    """
    Compile C++ code for specified board
    
    Example request:
    {
        "board": "uno",
        "code": "#include <Arduino.h>\\nvoid setup() {}\\nvoid loop() {}",
        "libraries": ["Wire", "SPI"],
        "build_flags": ["-DDEBUG"]
    }
    """
    # Validate board
    if request.board not in SUPPORTED_BOARDS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported board: {request.board}. Use GET /boards to see supported boards."
        )
    
    # Create unique job ID and project directory
    job_id = str(uuid.uuid4())[:8]
    project_dir = UPLOAD_DIR / job_id
    src_dir = project_dir / "src"
    
    try:
        # Create project structure
        src_dir.mkdir(parents=True, exist_ok=True)
        
        # Write main source file
        main_file = src_dir / "main.cpp"
        main_file.write_text(request.code)
        
        # Create platformio.ini
        board_config = SUPPORTED_BOARDS[request.board]
        create_platformio_ini(project_dir, board_config, request.libraries, request.build_flags)
        
        # Run compilation
        success, stdout, stderr = run_pio_compile(project_dir)
        
        if success:
            firmware = find_firmware_file(project_dir)
            firmware_size = firmware.stat().st_size if firmware else None
            
            # Schedule cleanup after 1 hour
            # background_tasks.add_task(cleanup_project, project_dir)
            
            return CompileResponse(
                success=True,
                message="Compilation successful",
                job_id=job_id,
                output=stdout[-5000:] if len(stdout) > 5000 else stdout,  # Limit output size
                firmware_url=f"/download/{job_id}",
                firmware_size=firmware_size
            )
        else:
            # Cleanup failed projects
            background_tasks.add_task(cleanup_project, project_dir)
            
            return CompileResponse(
                success=False,
                message="Compilation failed",
                job_id=job_id,
                output=stdout[-2000:] if len(stdout) > 2000 else stdout,
                errors=stderr[-5000:] if len(stderr) > 5000 else stderr
            )
            
    except Exception as e:
        # Cleanup on error
        if project_dir.exists():
            shutil.rmtree(project_dir)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/compile/upload", response_model=CompileResponse)
async def compile_uploaded_files(
    background_tasks: BackgroundTasks,
    board: str = Form(...),
    libraries: str = Form(""),
    build_flags: str = Form(""),
    files: List[UploadFile] = File(...)
):
    """
    Compile uploaded C++/H files
    
    Form data:
    - board: Target board (e.g., "uno", "esp32")
    - libraries: Comma-separated library names (optional)
    - build_flags: Comma-separated build flags (optional)
    - files: Multiple .cpp, .c, .h, .hpp files
    """
    # Validate board
    if board not in SUPPORTED_BOARDS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported board: {board}. Use GET /boards to see supported boards."
        )
    
    # Parse libraries and build flags
    lib_list = [lib.strip() for lib in libraries.split(",") if lib.strip()]
    flag_list = [flag.strip() for flag in build_flags.split(",") if flag.strip()]
    
    # Create unique job ID and project directory
    job_id = str(uuid.uuid4())[:8]
    project_dir = UPLOAD_DIR / job_id
    src_dir = project_dir / "src"
    include_dir = project_dir / "include"
    
    try:
        # Create project structure
        src_dir.mkdir(parents=True, exist_ok=True)
        include_dir.mkdir(parents=True, exist_ok=True)
        
        has_main = False
        
        # Save uploaded files
        for file in files:
            if not file.filename:
                continue
                
            filename = file.filename
            ext = Path(filename).suffix.lower()
            
            # Determine destination directory
            if ext in [".h", ".hpp"]:
                dest_dir = include_dir
            else:
                dest_dir = src_dir
            
            # Save file
            dest_path = dest_dir / filename
            content = await file.read()
            async with aiofiles.open(dest_path, 'wb') as f:
                await f.write(content)
            
            # Check for main/setup/loop
            if ext in [".cpp", ".c", ".ino"]:
                text_content = content.decode('utf-8', errors='ignore')
                if "void setup(" in text_content or "void loop(" in text_content or "int main(" in text_content:
                    has_main = True
                    # Rename .ino to .cpp
                    if ext == ".ino":
                        new_path = dest_dir / (Path(filename).stem + ".cpp")
                        dest_path.rename(new_path)
        
        if not has_main:
            raise HTTPException(
                status_code=400,
                detail="No main entry point found. Ensure your code has setup()/loop() or main() function."
            )
        
        # Create platformio.ini
        board_config = SUPPORTED_BOARDS[board]
        create_platformio_ini(project_dir, board_config, lib_list, flag_list)
        
        # Run compilation
        success, stdout, stderr = run_pio_compile(project_dir)
        
        if success:
            firmware = find_firmware_file(project_dir)
            firmware_size = firmware.stat().st_size if firmware else None
            
            return CompileResponse(
                success=True,
                message="Compilation successful",
                job_id=job_id,
                output=stdout[-5000:] if len(stdout) > 5000 else stdout,
                firmware_url=f"/download/{job_id}",
                firmware_size=firmware_size
            )
        else:
            background_tasks.add_task(cleanup_project, project_dir)
            
            return CompileResponse(
                success=False,
                message="Compilation failed",
                job_id=job_id,
                output=stdout[-2000:] if len(stdout) > 2000 else stdout,
                errors=stderr[-5000:] if len(stderr) > 5000 else stderr
            )
            
    except HTTPException:
        raise
    except Exception as e:
        if project_dir.exists():
            shutil.rmtree(project_dir)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/download/{job_id}")
async def download_firmware(job_id: str):
    """Download compiled firmware file"""
    project_dir = UPLOAD_DIR / job_id
    
    if not project_dir.exists():
        raise HTTPException(status_code=404, detail="Job not found or expired")
    
    firmware = find_firmware_file(project_dir)
    
    if not firmware:
        raise HTTPException(status_code=404, detail="Firmware file not found")
    
    return FileResponse(
        path=firmware,
        filename=firmware.name,
        media_type="application/octet-stream"
    )


@app.get("/download/{job_id}/all")
async def download_all_firmware(job_id: str):
    """Download all compiled files as ZIP"""
    project_dir = UPLOAD_DIR / job_id
    
    if not project_dir.exists():
        raise HTTPException(status_code=404, detail="Job not found or expired")
    
    build_dir = project_dir / ".pio" / "build" / "target"
    
    if not build_dir.exists():
        raise HTTPException(status_code=404, detail="Build directory not found")
    
    # Create ZIP file
    zip_path = project_dir / f"firmware_{job_id}.zip"
    shutil.make_archive(str(zip_path.with_suffix("")), 'zip', build_dir)
    
    return FileResponse(
        path=zip_path,
        filename=f"firmware_{job_id}.zip",
        media_type="application/zip"
    )


@app.get("/status/{job_id}")
async def check_status(job_id: str):
    """Check compilation job status"""
    project_dir = UPLOAD_DIR / job_id
    
    if not project_dir.exists():
        return {"status": "not_found", "message": "Job not found or expired"}
    
    firmware = find_firmware_file(project_dir)
    
    if firmware:
        return {
            "status": "completed",
            "firmware_url": f"/download/{job_id}",
            "firmware_size": firmware.stat().st_size,
            "firmware_name": firmware.name
        }
    else:
        return {"status": "pending_or_failed", "message": "No firmware found"}


@app.delete("/cleanup/{job_id}")
async def manual_cleanup(job_id: str):
    """Manually cleanup a job's files"""
    project_dir = UPLOAD_DIR / job_id
    
    if project_dir.exists():
        shutil.rmtree(project_dir)
        return {"success": True, "message": f"Job {job_id} cleaned up"}
    else:
        return {"success": False, "message": "Job not found"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    # Check if PlatformIO is available
    try:
        result = subprocess.run([PIO_PATH, "--version"], capture_output=True, text=True)
        pio_version = result.stdout.strip()
        pio_ok = result.returncode == 0
    except Exception:
        pio_version = "Unknown"
        pio_ok = False
    
    return {
        "status": "healthy" if pio_ok else "unhealthy",
        "platformio": {
            "available": pio_ok,
            "version": pio_version
        },
        "timestamp": datetime.now().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
