<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\SchoolYearController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\ScannerController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\StudentBarcodeController;
use App\Http\Controllers\StudentLogController;

Route::apiResource('courses', CourseController::class);
Route::apiResource('school-years', SchoolYearController::class);
Route::apiResource('sections', SectionController::class);
Route::apiResource('scanners', ScannerController::class);
Route::apiResource('students', StudentController::class);
Route::apiResource('student-barcodes', StudentBarcodeController::class);
Route::apiResource('student-logs', StudentLogController::class);
