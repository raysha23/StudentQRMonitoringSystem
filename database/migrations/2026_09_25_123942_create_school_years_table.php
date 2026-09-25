<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_years', function (Blueprint $table) {
            $table->id('SchoolYearID');
            $table->string('SchoolYearName', 20)->unique();
            $table->date('StartDate')->nullable();
            $table->date('EndDate')->nullable();
            $table->string('Status', 20);
            $table->timestamp('CreatedAt')->nullable();
            $table->timestamp('UpdatedAt')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_years');
    }
};
