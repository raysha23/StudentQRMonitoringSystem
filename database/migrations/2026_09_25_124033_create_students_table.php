<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id('StudentID');
            $table->string('StudentNumber', 50)->unique();
            $table->string('FirstName', 100);
            $table->string('MiddleName', 100)->nullable();
            $table->string('LastName', 100);
            $table->string('Suffix', 20)->nullable();
            $table->date('DateOfBirth')->nullable();
            $table->string('Gender', 20)->nullable();
            $table->string('Address', 255)->nullable();
            $table->string('ContactNumber', 30)->nullable();
            $table->string('Email', 150)->nullable();
             $table->string('ProfilePicture', 255)->nullable(); 
            $table->foreignId('CourseID')->constrained('courses', 'CourseID');
            $table->foreignId('SectionID')->constrained('sections', 'SectionID');
            $table->integer('YearLevel')->nullable();
            $table->foreignId('SchoolYearID')->constrained('school_years', 'SchoolYearID');
            $table->string('Status', 20); // Enrolled / Not Enrolled
            $table->timestamp('CreatedAt')->nullable();
            $table->timestamp('UpdatedAt')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
