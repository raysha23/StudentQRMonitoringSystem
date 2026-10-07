<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('positions', function (Blueprint $table) {
            $table->id('PositionID');
            $table->string('PositionTitle', 150)->unique();
            $table->string('PositionType', 30); // Teaching | Non-Teaching
            $table->string('Status', 20)->default('Active');
            $table->timestamp('CreatedAt')->nullable();
            $table->timestamp('UpdatedAt')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('positions');
    }
};
