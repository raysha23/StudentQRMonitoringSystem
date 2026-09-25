<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentBarcode extends Model
{
    protected $table = 'student_barcodes';
    protected $primaryKey = 'BarcodeID';
    public $timestamps = false; // this table uses GeneratedAt/DeactivatedAt instead

    protected $fillable = ['StudentID', 'BarcodeValue', 'BarcodeFormat', 'Status', 'GeneratedAt', 'DeactivatedAt'];

    public function student()
    {
        return $this->belongsTo(Student::class, 'StudentID', 'StudentID');
    }

    public function logs()
    {
        return $this->hasMany(StudentLog::class, 'BarcodeID', 'BarcodeID');
    }
}
