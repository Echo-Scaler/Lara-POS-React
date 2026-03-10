<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    /**
     * Build success response
     *
     * @param string|array $data
     * @param string $message
     * @param int $code
     * @return JsonResponse
     */
    public function successResponse($data, $message = '', $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data
        ], $code);
    }

    /**
     * Build error response
     *
     * @param string|array $message
     * @param int $code
     * @param array $errors
     * @return JsonResponse
     */
    public function errorResponse($message, $code, $errors = [])
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }
}
