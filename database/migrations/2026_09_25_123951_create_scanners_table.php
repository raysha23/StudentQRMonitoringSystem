<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scanners', function (Blueprint $table) {
            $table->id('ScannerID');
            $table->string('ScannerName', 100);
            $table->string('DeviceName', 100);
            $table->string('Location', 150)->nullable();
            $table->string('ScannerType', 20);
            $table->string('Status', 20);
            $table->timestamp('CreatedAt')->nullable();
            $table->timestamp('UpdatedAt')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scanners');
    }
};
