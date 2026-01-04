// Sirobo Custom Blockly Blocks
// Blocks for robot control, sensors, LED, motors, etc.

import Blockly from 'blockly'

// Color scheme for different block categories
const COLORS = {
  MOTOR: '#22c55e',      // Green
  SENSOR: '#3b82f6',     // Blue
  LED: '#a855f7',        // Purple
  SOUND: '#ec4899',      // Pink
  LOGIC: '#f59e0b',      // Amber
  LOOPS: '#06b6d4',      // Cyan
  MATH: '#ef4444',       // Red
  VARIABLES: '#8b5cf6',  // Violet
  FUNCTIONS: '#f97316',  // Orange
}

// =====================================================
// MOTOR BLOCKS
// =====================================================

Blockly.Blocks['robot_maju'] = {
  init: function() {
    this.appendValueInput('SPEED')
        .setCheck('Number')
        .appendField('🚗 Robot Maju dengan kecepatan');
    this.appendDummyInput()
        .appendField('%');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.MOTOR);
    this.setTooltip('Gerakkan robot maju dengan kecepatan tertentu');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_mundur'] = {
  init: function() {
    this.appendValueInput('SPEED')
        .setCheck('Number')
        .appendField('🔙 Robot Mundur dengan kecepatan');
    this.appendDummyInput()
        .appendField('%');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.MOTOR);
    this.setTooltip('Gerakkan robot mundur dengan kecepatan tertentu');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_belok_kiri'] = {
  init: function() {
    this.appendValueInput('SPEED')
        .setCheck('Number')
        .appendField('⬅️ Belok Kiri dengan kecepatan');
    this.appendDummyInput()
        .appendField('%');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.MOTOR);
    this.setTooltip('Robot belok ke kiri');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_belok_kanan'] = {
  init: function() {
    this.appendValueInput('SPEED')
        .setCheck('Number')
        .appendField('➡️ Belok Kanan dengan kecepatan');
    this.appendDummyInput()
        .appendField('%');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.MOTOR);
    this.setTooltip('Robot belok ke kanan');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_putar'] = {
  init: function() {
    this.appendValueInput('ANGLE')
        .setCheck('Number')
        .appendField('🔄 Putar robot')
    this.appendDummyInput()
        .appendField('derajat');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.MOTOR);
    this.setTooltip('Putar robot dengan sudut tertentu (positif = kanan, negatif = kiri)');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_putar_sudut'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🔄 Putar ke sudut')
        .appendField(new Blockly.FieldDropdown([
          ['90° Kanan', '90'],
          ['90° Kiri', '-90'],
          ['180° (Balik)', '180'],
          ['45° Kanan', '45'],
          ['45° Kiri', '-45'],
        ]), 'ANGLE');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.MOTOR);
    this.setTooltip('Putar robot dengan sudut yang sudah ditentukan');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_stop'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🛑 Robot Berhenti');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.MOTOR);
    this.setTooltip('Hentikan semua gerakan robot');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['robot_atur_motor'] = {
  init: function() {
    this.appendValueInput('LEFT')
        .setCheck('Number')
        .appendField('⚙️ Motor Kiri');
    this.appendValueInput('RIGHT')
        .setCheck('Number')
        .appendField('Kanan');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.MOTOR);
    this.setTooltip('Atur kecepatan motor kiri dan kanan secara manual (-100 sampai 100)');
    this.setHelpUrl('');
  }
};

// =====================================================
// SENSOR BLOCKS
// =====================================================

Blockly.Blocks['sensor_garis'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('📊 Sensor Garis')
        .appendField(new Blockly.FieldDropdown([
          ['1 (Ujung Kiri)', '0'],
          ['2', '1'],
          ['3', '2'],
          ['4', '3'],
          ['5', '4'],
          ['6', '5'],
          ['7', '6'],
          ['8 (Ujung Kanan)', '7'],
        ]), 'INDEX');
    this.setOutput(true, 'Number');
    this.setColour(COLORS.SENSOR);
    this.setTooltip('Baca nilai sensor garis (0-4095)');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['sensor_garis_deteksi'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('📊 Sensor Garis')
        .appendField(new Blockly.FieldDropdown([
          ['1 (Ujung Kiri)', '0'],
          ['2', '1'],
          ['3', '2'],
          ['4', '3'],
          ['5', '4'],
          ['6', '5'],
          ['7', '6'],
          ['8 (Ujung Kanan)', '7'],
        ]), 'INDEX')
        .appendField('mendeteksi garis?');
    this.setOutput(true, 'Boolean');
    this.setColour(COLORS.SENSOR);
    this.setTooltip('Cek apakah sensor mendeteksi garis (true/false)');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['sensor_jarak'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('📡 Jarak ke halangan (cm)');
    this.setOutput(true, 'Number');
    this.setColour(COLORS.SENSOR);
    this.setTooltip('Baca jarak ke halangan dalam centimeter');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['sensor_jarak_kondisi'] = {
  init: function() {
    this.appendValueInput('DISTANCE')
        .setCheck('Number')
        .appendField('📡 Halangan terdeteksi dalam');
    this.appendDummyInput()
        .appendField('cm?');
    this.setInputsInline(true);
    this.setOutput(true, 'Boolean');
    this.setColour(COLORS.SENSOR);
    this.setTooltip('Cek apakah ada halangan dalam jarak tertentu');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['sensor_ldr'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('☀️ Sensor Cahaya')
        .appendField(new Blockly.FieldDropdown([
          ['Kiri', '0'],
          ['Kanan', '1'],
        ]), 'INDEX');
    this.setOutput(true, 'Number');
    this.setColour(COLORS.SENSOR);
    this.setTooltip('Baca nilai sensor cahaya LDR (0-4095)');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['sensor_imu_yaw'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🧭 Sudut Yaw (derajat)');
    this.setOutput(true, 'Number');
    this.setColour(COLORS.SENSOR);
    this.setTooltip('Baca sudut yaw dari IMU (0-360)');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['sensor_imu_pitch'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🧭 Sudut Pitch (derajat)');
    this.setOutput(true, 'Number');
    this.setColour(COLORS.SENSOR);
    this.setTooltip('Baca sudut pitch dari IMU');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['sensor_imu_roll'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🧭 Sudut Roll (derajat)');
    this.setOutput(true, 'Number');
    this.setColour(COLORS.SENSOR);
    this.setTooltip('Baca sudut roll dari IMU');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['sensor_imu_reset'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🧭 Reset IMU Yaw');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.SENSOR);
    this.setTooltip('Reset sudut yaw ke 0');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['sensor_button'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🔘 Tombol')
        .appendField(new Blockly.FieldDropdown([
          ['1 (Merah)', '0'],
          ['2 (Hijau)', '1'],
          ['3 (Biru)', '2'],
          ['4 (Kuning)', '3'],
        ]), 'INDEX')
        .appendField('ditekan?');
    this.setOutput(true, 'Boolean');
    this.setColour(COLORS.SENSOR);
    this.setTooltip('Cek apakah tombol ditekan');
    this.setHelpUrl('');
  }
};

// =====================================================
// LED BLOCKS
// =====================================================

Blockly.Blocks['led_nyala'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('💡 LED')
        .appendField(new Blockly.FieldDropdown([
          ['1', '0'],
          ['2', '1'],
          ['Semua', 'all'],
        ]), 'INDEX')
        .appendField('warna')
        .appendField(new Blockly.FieldDropdown([
          ['🔴 Merah', 'red'],
          ['🟢 Hijau', 'green'],
          ['🔵 Biru', 'blue'],
          ['🟡 Kuning', 'yellow'],
          ['🟣 Ungu', 'purple'],
          ['🟠 Oranye', 'orange'],
          ['⚪ Putih', 'white'],
          ['🌈 Pelangi', 'rainbow'],
        ]), 'COLOR');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.LED);
    this.setTooltip('Nyalakan LED dengan warna tertentu');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['led_rgb'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('💡 LED')
        .appendField(new Blockly.FieldDropdown([
          ['1', '0'],
          ['2', '1'],
          ['Semua', 'all'],
        ]), 'INDEX');
    this.appendValueInput('R')
        .setCheck('Number')
        .appendField('R');
    this.appendValueInput('G')
        .setCheck('Number')
        .appendField('G');
    this.appendValueInput('B')
        .setCheck('Number')
        .appendField('B');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.LED);
    this.setTooltip('Atur warna LED dengan nilai RGB (0-255)');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['led_mati'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('💡 Matikan LED')
        .appendField(new Blockly.FieldDropdown([
          ['1', '0'],
          ['2', '1'],
          ['Semua', 'all'],
        ]), 'INDEX');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.LED);
    this.setTooltip('Matikan LED');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['led_kedip'] = {
  init: function() {
    this.appendValueInput('TIMES')
        .setCheck('Number')
        .appendField('💡 LED kedip');
    this.appendDummyInput()
        .appendField('kali');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.LED);
    this.setTooltip('LED berkedip beberapa kali');
    this.setHelpUrl('');
  }
};

// =====================================================
// SOUND BLOCKS
// =====================================================

Blockly.Blocks['bunyi_nada'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🎵 Bunyi nada')
        .appendField(new Blockly.FieldDropdown([
          ['Do', '262'],
          ['Re', '294'],
          ['Mi', '330'],
          ['Fa', '349'],
          ['Sol', '392'],
          ['La', '440'],
          ['Si', '494'],
          ['Do tinggi', '523'],
        ]), 'NOTE');
    this.appendValueInput('DURATION')
        .setCheck('Number')
        .appendField('selama');
    this.appendDummyInput()
        .appendField('ms');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.SOUND);
    this.setTooltip('Bunyikan nada tertentu');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['bunyi_frekuensi'] = {
  init: function() {
    this.appendValueInput('FREQ')
        .setCheck('Number')
        .appendField('🎵 Bunyi frekuensi');
    this.appendDummyInput()
        .appendField('Hz selama');
    this.appendValueInput('DURATION')
        .setCheck('Number');
    this.appendDummyInput()
        .appendField('ms');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.SOUND);
    this.setTooltip('Bunyikan frekuensi tertentu');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['bunyi_melody'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🎵 Mainkan melodi')
        .appendField(new Blockly.FieldDropdown([
          ['😊 Happy', 'happy'],
          ['🎺 March', 'march'],
          ['🏆 Victory', 'victory'],
          ['❌ Error', 'error'],
          ['🚀 Startup', 'startup'],
          ['👋 Hello', 'hello'],
        ]), 'MELODY');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.SOUND);
    this.setTooltip('Mainkan melodi yang sudah ditentukan');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['bunyi_stop'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🔇 Stop bunyi');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.SOUND);
    this.setTooltip('Hentikan bunyi');
    this.setHelpUrl('');
  }
};

// =====================================================
// DISPLAY BLOCKS
// =====================================================

Blockly.Blocks['oled_tampilkan_teks'] = {
  init: function() {
    this.appendValueInput('TEXT')
        .setCheck('String')
        .appendField('📺 Tampilkan teks');
    this.appendDummyInput()
        .appendField('baris')
        .appendField(new Blockly.FieldDropdown([
          ['1', '0'],
          ['2', '1'],
          ['3', '2'],
          ['4', '3'],
        ]), 'LINE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#6366f1');
    this.setTooltip('Tampilkan teks di layar OLED');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['oled_tampilkan_angka'] = {
  init: function() {
    this.appendValueInput('NUMBER')
        .setCheck('Number')
        .appendField('📺 Tampilkan angka');
    this.appendDummyInput()
        .appendField('baris')
        .appendField(new Blockly.FieldDropdown([
          ['1', '0'],
          ['2', '1'],
          ['3', '2'],
          ['4', '3'],
        ]), 'LINE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#6366f1');
    this.setTooltip('Tampilkan angka di layar OLED');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['oled_hapus'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('📺 Hapus layar');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#6366f1');
    this.setTooltip('Hapus semua tampilan di layar OLED');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['oled_gambar'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('📺 Tampilkan gambar')
        .appendField(new Blockly.FieldDropdown([
          ['😊 Senang', 'happy'],
          ['😢 Sedih', 'sad'],
          ['😮 Kaget', 'surprised'],
          ['❤️ Hati', 'heart'],
          ['⭐ Bintang', 'star'],
          ['🤖 Robot', 'robot'],
        ]), 'IMAGE');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#6366f1');
    this.setTooltip('Tampilkan gambar di layar OLED');
    this.setHelpUrl('');
  }
};

// =====================================================
// LINE FOLLOWER BLOCKS
// =====================================================

Blockly.Blocks['line_follower_mulai'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🛤️ Mulai Line Follower');
    this.appendValueInput('SPEED')
        .setCheck('Number')
        .appendField('kecepatan');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#10b981');
    this.setTooltip('Mulai mode line follower otomatis');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['line_follower_stop'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🛤️ Stop Line Follower');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#10b981');
    this.setTooltip('Hentikan mode line follower');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['line_follower_sampai_persimpangan'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🛤️ Deteksi persimpangan')
        .appendField(new Blockly.FieldDropdown([
          ['Kiri', 'left'],
          ['Kanan', 'right'],
          ['T', 't'],
          ['+', 'cross'],
        ]), 'TYPE')
        .appendField('?');
    this.setOutput(true, 'Boolean');
    this.setColour('#10b981');
    this.setTooltip('Cek apakah sampai di persimpangan');
    this.setHelpUrl('');
  }
};

// =====================================================
// TIMING BLOCKS
// =====================================================

Blockly.Blocks['tunggu'] = {
  init: function() {
    this.appendValueInput('TIME')
        .setCheck('Number')
        .appendField('⏱️ Tunggu');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['detik', 'seconds'],
          ['milidetik', 'ms'],
        ]), 'UNIT');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(COLORS.LOOPS);
    this.setTooltip('Tunggu beberapa waktu');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['waktu_berjalan'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('⏱️ Waktu berjalan (ms)');
    this.setOutput(true, 'Number');
    this.setColour(COLORS.LOOPS);
    this.setTooltip('Waktu sejak program dimulai dalam milidetik');
    this.setHelpUrl('');
  }
};

// =====================================================
// CALIBRATION BLOCKS
// =====================================================

Blockly.Blocks['kalibrasi_motor'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('⚙️ Kalibrasi Motor');
    this.appendValueInput('LEFT')
        .setCheck('Number')
        .appendField('Kiri');
    this.appendValueInput('RIGHT')
        .setCheck('Number')
        .appendField('Kanan');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#64748b');
    this.setTooltip('Atur offset kalibrasi motor (-50 sampai 50)');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['simpan_kalibrasi'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('💾 Simpan Kalibrasi ke EEPROM');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#64748b');
    this.setTooltip('Simpan nilai kalibrasi ke memori permanen');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['auto_kalibrasi'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🔧 Auto Kalibrasi Motor Lurus');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#64748b');
    this.setTooltip('Kalibrasi otomatis agar robot berjalan lurus menggunakan yaw');
    this.setHelpUrl('');
  }
};

// =====================================================
// EVENT BLOCKS
// =====================================================

Blockly.Blocks['saat_mulai'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🚀 Saat program dimulai');
    this.appendStatementInput('DO')
        .setCheck(null);
    this.setColour(COLORS.FUNCTIONS);
    this.setTooltip('Blok ini dijalankan saat program dimulai');
    this.setHelpUrl('');
  }
};

Blockly.Blocks['selalu_ulangi'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('🔁 Selalu ulangi');
    this.appendStatementInput('DO')
        .setCheck(null);
    this.setColour(COLORS.LOOPS);
    this.setTooltip('Blok ini dijalankan terus menerus');
    this.setHelpUrl('');
  }
};

export default Blockly
