<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('person_logs', function (Blueprint $table) {
            $table->id('LogID');
            $table->foreignId('StudentID')->nullable()->constrained('students', 'StudentID');
            $table->foreignId('EmployeeID')->nullable()->constrained('employees', 'EmployeeID');
            $table->foreignId('BarcodeID')->constrained('person_barcodes', 'BarcodeID');
            $table->string('LogType', 20); // TIME IN / TIME OUT
            $table->timestamp('ScannedAt');
            $table->foreignId('ScannerID')->constrained('scanners', 'ScannerID');
            $table->string('Remarks', 255)->nullable();

            $table->index(['StudentID', 'ScannedAt']);
            $table->index(['EmployeeID', 'ScannedAt']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('person_logs');
    }
};
