<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_barcodes', function (Blueprint $table) {
            $table->id('BarcodeID');
            $table->foreignId('StudentID')->constrained('students', 'StudentID');
            $table->string('BarcodeValue', 255)->unique();
            $table->string('BarcodeFormat', 20);
            $table->string('Status', 20);
            $table->timestamp('GeneratedAt')->nullable();
            $table->timestamp('DeactivatedAt')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_barcodes');
    }
};
