<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->string('DepartmentType', 20)->default('Non-Teaching')->after('DepartmentName');
            $table->dropColumn('DepartmentHead');
        });
    }

    public function down(): void
    {
        Schema::table('departments', function (Blueprint $table) {
            $table->dropColumn('DepartmentType');
            $table->string('DepartmentHead', 150)->nullable();
        });
    }
};
