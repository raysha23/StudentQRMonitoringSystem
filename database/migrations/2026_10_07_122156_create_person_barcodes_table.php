<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('person_barcodes', function (Blueprint $table) {
            $table->id('BarcodeID');
            // Exactly one of these is filled (enforced in the controller)
            $table->foreignId('StudentID')->nullable()->constrained('students', 'StudentID');
            $table->foreignId('EmployeeID')->nullable()->constrained('employees', 'EmployeeID');
            $table->string('BarcodeValue', 255)->unique();
            $table->string('BarcodeFormat', 20);
            $table->string('Status', 20);
            $table->timestamp('GeneratedAt')->nullable();
            $table->timestamp('DeactivatedAt')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('person_barcodes');
    }
};
