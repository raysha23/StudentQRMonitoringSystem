<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->id('DepartmentID');
            $table->string('DepartmentCode', 20)->unique();
            $table->string('DepartmentName', 150);
            $table->string('DepartmentHead', 150)->nullable();
            $table->string('Status', 20)->default('Active');
            $table->timestamp('CreatedAt')->nullable();
            $table->timestamp('UpdatedAt')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};
