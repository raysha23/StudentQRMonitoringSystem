<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id('EmployeeID');
            $table->unsignedBigInteger('DepartmentID')->nullable();
            $table->string('EmployeeNo', 20)->unique();
            $table->string('FirstName', 100);
            $table->string('MiddleName', 100)->nullable();
            $table->string('LastName', 100);
            $table->foreignId('PositionID')->constrained('positions', 'PositionID');
            $table->string('Email', 150)->unique();
            $table->string('Phone', 20)->nullable();
            $table->string('ProfilePicture', 255)->nullable();
            $table->string('Status', 20)->default('Active');
            $table->timestamp('CreatedAt')->nullable();
            $table->timestamp('UpdatedAt')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
