<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['Username', 'PasswordHash', 'FirstName', 'LastName', 'Status'])]
#[Hidden(['PasswordHash', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $primaryKey = 'UserID';
    protected $table = 'users_custom';
    /**
     * Tell Laravel's auth system to check this column instead of the
     * default "password" column when hashing/verifying credentials.
     */
    protected $authPasswordName = 'PasswordHash';

    protected function casts(): array
    {
        return [
            'PasswordHash' => 'hashed',
        ];
    }
    public function getRouteKeyName(): string
    {
        return 'UserID';
    }
}
