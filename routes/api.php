<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\SchoolYearController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\ScannerController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\PersonBarcodeController;
use App\Http\Controllers\PersonLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\EmployeeController;
// --------------------------------------------------------------------------
// System Management Routes
// --------------------------------------------------------------------------
Route::apiResource('courses', CourseController::class);
Route::apiResource('school-years', SchoolYearController::class);
Route::apiResource('sections', SectionController::class);
Route::apiResource('scanners', ScannerController::class);
Route::get('students/counts', [StudentController::class, 'counts']);
Route::patch('students/{student}/restore', [StudentController::class, 'restore']);
Route::apiResource('students', StudentController::class);


Route::apiResource('departments', DepartmentController::class);
Route::apiResource('positions', PositionController::class);
Route::apiResource('subjects', SubjectController::class);


Route::get('employees/counts', [EmployeeController::class, 'counts']);
Route::patch('employees/{employee}/restore', [EmployeeController::class, 'restore']);
Route::apiResource('employees', EmployeeController::class);

// Barcodes
Route::apiResource('person-barcodes', PersonBarcodeController::class)->only(['index', 'show']);

Route::controller(PersonBarcodeController::class)->group(function () {
    Route::get('/students/{student}/barcode', 'forStudent');
    Route::post('/students/{student}/barcode/reissue', 'reissueForStudent');
    Route::get('/employees/{employee}/barcode', 'forEmployee');
    Route::post('/employees/{employee}/barcode/reissue', 'reissueForEmployee');
});

// Logs & scanning ('today' must come BEFORE the apiResource)
Route::controller(PersonLogController::class)->group(function () {
    Route::post('/scan', 'scan');
    Route::get('/person-logs/today', 'today');
    Route::get('/person-logs/export', 'export');
});

Route::apiResource('person-logs', PersonLogController::class)->only(['index', 'show', 'destroy']);

// --------------------------------------------------------------------------
// Auth Routes
// --------------------------------------------------------------------------
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});
