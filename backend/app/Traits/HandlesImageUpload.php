<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait HandlesImageUpload
{
    /**
     * Store an uploaded image in the given folder on the public disk
     * and return the stored path.
     *
     * @param  UploadedFile  $file
     * @param  string        $folder  e.g. 'avatars', 'products'
     * @return string
     */
    protected function uploadImage(UploadedFile $file, string $folder): string
    {
        $filename = $folder . '/' . Str::random(40) . '.' . $file->getClientOriginalExtension();

        Storage::disk('public')->put($filename, file_get_contents($file));

        return $filename;
    }

    /**
     * Delete an existing image from the public disk (if it exists) and
     * store the new one, returning the new path.
     *
     * @param  UploadedFile  $file
     * @param  string|null   $existing  Current stored path to delete
     * @param  string        $folder
     * @return string
     */
    protected function replaceImage(UploadedFile $file, ?string $existing, string $folder): string
    {
        if ($existing) {
            Storage::disk('public')->delete($existing);
        }

        return $this->uploadImage($file, $folder);
    }
}
