# Digital Bulletin Board for University

## Problem Statement

The university currently relies on a physical notice board for announcements. Students only see updates if they pass by, causing important notices to go unnoticed. There is no interaction or instant update mechanism.

## Objectives

Create a digital web application where faculty can post announcements, and students can view, like, and comment. Students can subscribe to receive notifications. This ensures better communication and engagement across the university.

## Scope

* Faculty module: post, edit, delete announcements.
* Student module: view announcements, like, comment.
* Notification system: alerts for new posts. (Right now the notifications are only limited to native browser notifications and in app /notifications page)
* Web-based interface: accessible on desktop and mobile.
* Public access: User doesn't need to signin to view announcements so students not enrolled in the university can see the announcements.

Excluded: private messaging or unrelated social media features.

## Description

A web platform where faculty can create and share announcements with a title, description, and timestamp. Students can like and comment. User activity is tracked and the interface is clean and searchable. Authentication restricts posting to faculty and interactions to registered students.

## Tools and Technologies

* **Frontend:** Nextjs
* **Database:** Turso SQLite
* **Language:** TypeScript

## ERD (Entity Relationship Diagram)

**Entities:**

* **User:** user_id, name, email, role, password
* **Announcement:** announcement_id, title, content, created_at, faculty_id [FK]
* **Like:** like_id, user_id [FK], announcement_id [FK]
* **Comment:** comment_id, user_id [FK], announcement_id [FK], content, created_at
* **Subscription:** subscription_id, user_id [FK], notify_enabled

**Relationships:**

* A User['Faculty' role] can create many Announcements.
* A User['Student and Faculty' role] can post many Comments on Announcements.
* A User['Student' role] can like many Announcements.
* A User['Student' role] can subscribe for notifications.

## Expected Result

* Faculty can publish announcements online.
* Students receive real-time notifications and can like/comment.
* Visibility, accessibility, and communication improve.
* Physical notice boards are no longer needed.

## Conclusion

The Digital Bulletin Board provides an interactive and accessible way to share information within the university. It enhances faculty-student communication, ensures announcements are seen, and is scalable for future improvements.
