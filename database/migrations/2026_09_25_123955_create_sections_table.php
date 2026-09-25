<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sections', function (Blueprint $table) {
            $table->id('SectionID');
            $table->string('SectionName', 100);
            $table->foreignId('CourseID')->constrained('courses', 'CourseID');
            $table->integer('YearLevel')->nullable();
            $table->foreignId('SchoolYearID')->constrained('school_years', 'SchoolYearID');
            $table->string('Adviser', 150)->nullable();
            $table->string('Status', 20);
            $table->timestamp('CreatedAt')->nullable();
            $table->timestamp('UpdatedAt')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sections');
    }
};
