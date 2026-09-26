<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;
    protected $table = 'students';
    protected $primaryKey = 'StudentID';
    const CREATED_AT = 'CreatedAt';
    const UPDATED_AT = 'UpdatedAt';

    protected $fillable = [
        'StudentNumber',
        'FirstName',
        'MiddleName',
        'LastName',
        'Suffix',
        'DateOfBirth',
        'Gender',
        'Address',
        'ContactNumber',
        'Email',
        'ProfilePicture',
        'CourseID',
        'SectionID',
        'YearLevel',
        'SchoolYearID',
        'Status',
    ];

    protected $appends = ['ProfilePictureUrl'];

    public function getProfilePictureUrlAttribute()
    {
        if (!$this->ProfilePicture) {
            return null;
        }

        // Already a full URL (e.g. seeded DiceBear placeholder) — use as-is.
        if (str_starts_with($this->ProfilePicture, 'http://') || str_starts_with($this->ProfilePicture, 'https://')) {
            return $this->ProfilePicture;
        }

        // Otherwise it's a relative path from storeAsWebp() — build the full URL.
        return asset('storage/' . $this->ProfilePicture);
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'CourseID', 'CourseID');
    }

    public function section()
    {
        return $this->belongsTo(Section::class, 'SectionID', 'SectionID');
    }

    public function schoolYear()
    {
        return $this->belongsTo(SchoolYear::class, 'SchoolYearID', 'SchoolYearID');
    }

    public function barcodes()
    {
        return $this->hasMany(StudentBarcode::class, 'StudentID', 'StudentID');
    }

    public function logs()
    {
        return $this->hasMany(StudentLog::class, 'StudentID', 'StudentID');
    }
}
