<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users_custom', function (Blueprint $table) {
            $table->id('UserID');
            $table->string('Username', 100)->unique();
            $table->string('PasswordHash', 255);
            $table->string('FirstName', 100);
            $table->string('LastName', 100);
            $table->string('Status', 20);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users_custom');
    }
};
