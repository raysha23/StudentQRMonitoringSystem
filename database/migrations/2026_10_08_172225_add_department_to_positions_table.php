<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('positions', function (Blueprint $table) {
            // "Instructor" can now exist in more than one department
            $table->dropUnique(['PositionTitle']);
            $table->dropColumn('PositionType');

            $table->foreignId('DepartmentID')
                ->nullable()
                ->after('PositionTitle')
                ->constrained('departments', 'DepartmentID')
                ->restrictOnDelete();

            $table->unique(['DepartmentID', 'PositionTitle']);
        });
    }

    public function down(): void
    {
        Schema::table('positions', function (Blueprint $table) {
            $table->dropUnique(['DepartmentID', 'PositionTitle']);
            $table->dropConstrainedForeignId('DepartmentID');
            $table->string('PositionType', 30)->default('Non-Teaching');
            $table->unique('PositionTitle');
        });
    }
};
