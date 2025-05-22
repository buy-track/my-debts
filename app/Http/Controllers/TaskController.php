<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class TaskController extends Controller
{
    private function getUserId()
    {
        return Auth::id();
    }

    /**
     * Get all tasks for the authenticated user by date.
     *
     * @return JsonResponse
     */
    public function getTasksByDate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date_format:Y-m-d',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $date = $request->input('date');
        $tasks = Task::where('user_id', $this->getUserId())
                    ->where('date', $date)
                    ->get();

        return response()->json($tasks);
    }

    /**
     * Get all tasks for the authenticated user grouped by date.
     * Optionally filter by date range.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getAllTasks(Request $request): JsonResponse
    {
        $query = Task::where('user_id', $this->getUserId());

        // Filter by date range if provided
        if ($request->has('start_date') && $request->has('end_date')) {
            $validator = Validator::make($request->all(), [
                'start_date' => 'required|date_format:Y-m-d',
                'end_date' => 'required|date_format:Y-m-d|after_or_equal:start_date',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $query->whereBetween('date', [
                $request->input('start_date'),
                $request->input('end_date')
            ]);
        }

        $tasks = $query->orderBy('date')
                    ->get()
                    ->groupBy(function($task) {
                        return $task->date->format('Y-m-d');
                    });

        return response()->json($tasks);
    }

    /**
     * Store a new task.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'text' => 'required|string|max:255',
            'date' => 'required|date_format:Y-m-d',
            'completed' => 'boolean',
            'amount' => 'nullable|numeric|min:0',
            'recipient' => 'nullable|string|max:255',
            'is_recurring' => 'boolean',
            'recurrence_months' => 'required_if:is_recurring,true|nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = [
            'text' => $request->input('text'),
            'date' => $request->input('date'),
            'completed' => $request->input('completed', false),
            'user_id' => $this->getUserId(),
            'amount' => $request->input('amount'),
            'recipient' => $request->input('recipient'),
            'is_recurring' => $request->input('is_recurring', false),
            'recurrence_months' => $request->input('recurrence_months'),
        ];

        if ($data['is_recurring'] && $data['recurrence_months']) {
            $data['remaining_occurrences'] = $data['recurrence_months'];
        }

        $task = Task::create($data);

        // Create future recurring tasks if needed
        if ($data['is_recurring'] && $data['recurrence_months']) {
            $date = Carbon::parse($data['date']);
            $futureData = $data;
            $futureData['is_recurring'] = false; // Future tasks are not recurring themselves
            $futureData['remaining_occurrences'] = null;

            for ($i = 1; $i < $data['recurrence_months']; $i++) {
                $futureData['date'] = $date->copy()->addMonths($i)->format('Y-m-d');
                Task::create($futureData);
            }
        }

        return response()->json($task, 201);
    }

    /**
     * Update an existing task.
     *
     * @param Request $request
     * @param Task $task
     * @return JsonResponse
     */
    public function update(Request $request, Task $task): JsonResponse
    {
        // Check if the task belongs to the authenticated user
        if ($task->user_id !== $this->getUserId()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'text' => 'sometimes|required|string|max:255',
            'completed' => 'sometimes|required|boolean',
            'amount' => 'nullable|numeric|min:0',
            'recipient' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $task->update($request->only(['text', 'completed','amount','recipient']));

        return response()->json($task);
    }

    /**
     * Delete a task.
     *
     * @param Task $task
     * @return JsonResponse
     */
    public function destroy(Task $task): JsonResponse
    {
        // Check if the task belongs to the authenticated user
        if ($task->user_id !== $this->getUserId()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $task->delete();

        return response()->json(null, 204);
    }
}
