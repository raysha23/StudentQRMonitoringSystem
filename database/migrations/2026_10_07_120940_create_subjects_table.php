<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id('SubjectID');
            $table->string('SubjectCode', 30)->unique();
            $table->string('SubjectTitle', 150);
            $table->foreignId('CourseID')->constrained('courses', 'CourseID');
            $table->unsignedTinyInteger('Units')->default(3);
            $table->string('Status', 20)->default('Active');
            $table->timestamp('CreatedAt')->nullable();
            $table->timestamp('UpdatedAt')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
