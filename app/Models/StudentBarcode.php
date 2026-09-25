<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentBarcode extends Model
{
    protected $table = 'student_barcodes';
    protected $primaryKey = 'BarcodeID';
    public $timestamps = false; // uses GeneratedAt/DeactivatedAt instead

    protected $fillable = [
        'StudentID',
        'BarcodeValue',
        'BarcodeFormat',
        'Status',
        'GeneratedAt',
        'DeactivatedAt',
    ];

    protected $casts = [
        'GeneratedAt'   => 'datetime',
        'DeactivatedAt' => 'datetime',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class, 'StudentID', 'StudentID');
    }

    public function logs()
    {
        return $this->hasMany(StudentLog::class, 'BarcodeID', 'BarcodeID');
    }

    /**
     * Generate a unique barcode for a student.
     * Format: {StudentID}-{6 random digits} e.g. "1-483920"
     */
    public static function generateFor(Student $student): self
    {
        do {
            $value = $student->StudentID
                . '-'
                . str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        } while (self::where('BarcodeValue', $value)->exists());

        return self::create([
            'StudentID'     => $student->StudentID,
            'BarcodeValue'  => $value,
            'BarcodeFormat' => 'CODE128',
            'Status'        => 'Active',
            'GeneratedAt'   => now(),
            'DeactivatedAt' => null,
        ]);
    }

    /**
     * Deactivate this barcode (e.g. when re-issuing a new one).
     */
    public function deactivate(): void
    {
        $this->update([
            'Status'        => 'Inactive',
            'DeactivatedAt' => now(),
        ]);
    }
}
