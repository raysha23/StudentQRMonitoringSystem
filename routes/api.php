<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\SchoolYearController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\ScannerController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\StudentBarcodeController;
use App\Http\Controllers\StudentLogController;
use App\Http\Controllers\AuthController;

// --------------------------------------------------------------------------
// System Management Routes
// --------------------------------------------------------------------------
Route::apiResource('courses', CourseController::class);
Route::apiResource('school-years', SchoolYearController::class);
Route::apiResource('sections', SectionController::class);
Route::apiResource('scanners', ScannerController::class);
Route::apiResource('students', StudentController::class);
Route::apiResource('student-barcodes', StudentBarcodeController::class);

// --------------------------------------------------------------------------
// Student Barcode Routes (per-student)
// --------------------------------------------------------------------------
Route::controller(StudentBarcodeController::class)->group(function () {
    Route::get('/students/{student}/barcode', 'forStudent');
    Route::post('/students/{student}/barcode/reissue', 'reissue');
});

// --------------------------------------------------------------------------
// Student Log & Scanning Routes
// --------------------------------------------------------------------------
Route::controller(StudentLogController::class)->group(function () {
    Route::post('/scan', 'scan');
    Route::get('/student-logs/today', 'today');
});

Route::apiResource('student-logs', StudentLogController::class);

// --------------------------------------------------------------------------
// Auth Routes
// --------------------------------------------------------------------------
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});
