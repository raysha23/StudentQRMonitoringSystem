<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_logs', function (Blueprint $table) {
            $table->id('LogID');
            $table->foreignId('StudentID')->constrained('students', 'StudentID');
            $table->foreignId('BarcodeID')->constrained('student_barcodes', 'BarcodeID');
            $table->string('LogType', 20); // TIME IN / TIME OUT
            $table->timestamp('ScannedAt');
            $table->foreignId('ScannerID')->constrained('scanners', 'ScannerID');
            $table->string('Remarks', 255)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_logs');
    }
};
