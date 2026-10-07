<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // /person-logs and /person-logs/today filter + sort by time only
        Schema::table('person_logs', function (Blueprint $table) {
            $table->index('ScannedAt', 'person_logs_scannedat_idx');
            $table->index('ScannerID', 'person_logs_scanner_idx');
        });

        // The scan lookup: BarcodeValue + Status
        // (skip this if BarcodeValue is already unique, which I haven't seen)
        Schema::table('person_barcodes', function (Blueprint $table) {
            $table->index(['BarcodeValue', 'Status'], 'person_barcodes_value_status_idx');
        });

        // Foreign keys are not auto-indexed in SQLite; these power filters and joins
        Schema::table('students', function (Blueprint $table) {
            $table->index(['CourseID', 'SectionID'], 'students_course_section_idx');
            $table->index('Status', 'students_status_idx');
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->index('PositionID', 'employees_position_idx');
            $table->index('DepartmentID', 'employees_department_idx');
        });
    }

    public function down(): void
    {
        Schema::table('person_logs', function (Blueprint $table) {
            $table->dropIndex('person_logs_scannedat_idx');
            $table->dropIndex('person_logs_scanner_idx');
        });
        Schema::table('person_barcodes', function (Blueprint $table) {
            $table->dropIndex('person_barcodes_value_status_idx');
        });
        Schema::table('students', function (Blueprint $table) {
            $table->dropIndex('students_course_section_idx');
            $table->dropIndex('students_status_idx');
        });
        Schema::table('employees', function (Blueprint $table) {
            $table->dropIndex('employees_position_idx');
            $table->dropIndex('employees_department_idx');
        });
    }
};
