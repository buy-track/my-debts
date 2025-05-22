# Task Management System

## Overview
This document provides instructions for setting up and using the task management system that has been integrated with the calendar application. The system allows users to create, read, update, and delete tasks associated with specific dates.

## Setup Instructions

1. **Run Migrations**
   ```bash
   php artisan migrate
   ```

2. **Seed the Database**
   ```bash
   php artisan db:seed
   ```
   This will create a demo user and sample tasks matching the original static data.

3. **Demo User Credentials**
   - Email: demo@example.com
   - Password: password

## API Endpoints

All API endpoints are protected by Laravel Sanctum authentication and require a valid CSRF token for requests.

### Get All Tasks
- **URL**: `/api/tasks`
- **Method**: GET
- **Description**: Retrieves all tasks for the authenticated user, grouped by date.

### Get Tasks by Date
- **URL**: `/api/tasks/by-date?date=YYYY-MM-DD`
- **Method**: GET
- **Description**: Retrieves all tasks for the authenticated user for a specific date.

### Create Task
- **URL**: `/api/tasks`
- **Method**: POST
- **Body**:
  ```json
  {
    "text": "Task description",
    "date": "YYYY-MM-DD",
    "completed": false
  }
  ```
- **Description**: Creates a new task for the authenticated user.

### Update Task
- **URL**: `/api/tasks/{task_id}`
- **Method**: PUT
- **Body**:
  ```json
  {
    "text": "Updated task description",
    "completed": true
  }
  ```
- **Description**: Updates an existing task.

### Delete Task
- **URL**: `/api/tasks/{task_id}`
- **Method**: DELETE
- **Description**: Deletes an existing task.

## Frontend Integration

The calendar.js file has been updated to use the API endpoints instead of static data. The following changes were made:

1. Replaced static tasks data with API calls
2. Added AJAX functionality for creating, updating, and deleting tasks
3. Added error handling for API requests
4. Added loading indicators for better user experience

## Database Schema

### Tasks Table
- `id`: Primary key
- `user_id`: Foreign key to users table
- `text`: Task description
- `date`: Date of the task
- `completed`: Boolean indicating if the task is completed
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

## Models

### Task Model
- Belongs to a User
- Fillable fields: text, date, completed, user_id
- Date field is cast to a date object
- Completed field is cast to a boolean

### User Model
- Has many Tasks
- Relationship method: `tasks()`

## Security Considerations

1. All API endpoints are protected by authentication
2. Tasks are scoped to the authenticated user
3. CSRF protection is enabled for all requests
4. Input validation is performed on all requests