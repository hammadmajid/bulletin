import { db } from "@/lib/db/client";
import { users, announcements, likes, comments, subscriptions } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is not available in production" },
      { status: 403 }
    );
  }

  try {
    // Create sample users
    const hashedPassword = await hashPassword("password123");

    const [faculty1] = await db
      .insert(users)
      .values({
        name: "Dr. Jane Smith",
        email: "jane.smith@university.edu",
        role: "Faculty",
        password: hashedPassword,
      })
      .returning();

    const [faculty2] = await db
      .insert(users)
      .values({
        name: "Prof. John Doe",
        email: "john.doe@university.edu",
        role: "Faculty",
        password: hashedPassword,
      })
      .returning();

    const [student1] = await db
      .insert(users)
      .values({
        name: "Alice Johnson",
        email: "alice@student.edu",
        role: "Student",
        password: hashedPassword,
      })
      .returning();

    const [student2] = await db
      .insert(users)
      .values({
        name: "Bob Williams",
        email: "bob@student.edu",
        role: "Student",
        password: hashedPassword,
      })
      .returning();

    const [student3] = await db
      .insert(users)
      .values({
        name: "Charlie Brown",
        email: "charlie@student.edu",
        role: "Student",
        password: hashedPassword,
      })
      .returning();

    // Create sample announcements
    const [announcement1] = await db
      .insert(announcements)
      .values({
        title: "Welcome to the New Semester!",
        content:
          "Welcome back everyone! I hope you had a restful break. This semester we'll be covering exciting topics including advanced algorithms, data structures, and system design. Office hours will be Monday and Wednesday from 2-4 PM. Looking forward to a great semester!",
        faculty_id: faculty1.user_id,
      })
      .returning();

    const [announcement2] = await db
      .insert(announcements)
      .values({
        title: "Midterm Exam Schedule Posted",
        content:
          "The midterm examination schedule has been posted. Please check the course portal for your specific exam times and locations. Remember to bring your student ID and arrive 15 minutes early. Good luck with your preparations!",
        faculty_id: faculty1.user_id,
      })
      .returning();

    const [announcement3] = await db
      .insert(announcements)
      .values({
        title: "Guest Lecture: AI in Healthcare",
        content:
          "We have a special guest lecture next Thursday at 3 PM in the main auditorium. Dr. Sarah Chen from TechHealth Inc. will be speaking about practical applications of AI in healthcare. This is a great networking opportunity - attendance is highly encouraged!",
        faculty_id: faculty2.user_id,
      })
      .returning();

    const [announcement4] = await db
      .insert(announcements)
      .values({
        title: "Research Assistant Positions Available",
        content:
          "I'm looking for motivated students to join my research team for the upcoming summer. We'll be working on machine learning applications in natural language processing. Requirements: GPA 3.5+, completed CS201, strong Python skills. Apply by sending your resume to my email.",
        faculty_id: faculty2.user_id,
      })
      .returning();

    // Create sample likes
    await db.insert(likes).values([
      { user_id: student1.user_id, announcement_id: announcement1.announcement_id },
      { user_id: student2.user_id, announcement_id: announcement1.announcement_id },
      { user_id: student3.user_id, announcement_id: announcement1.announcement_id },
      { user_id: student1.user_id, announcement_id: announcement3.announcement_id },
      { user_id: student2.user_id, announcement_id: announcement3.announcement_id },
      { user_id: student1.user_id, announcement_id: announcement4.announcement_id },
      { user_id: student3.user_id, announcement_id: announcement4.announcement_id },
    ]);

    // Create sample comments
    await db.insert(comments).values([
      {
        user_id: student1.user_id,
        announcement_id: announcement1.announcement_id,
        content: "Excited for this semester! Looking forward to the algorithms section.",
      },
      {
        user_id: student2.user_id,
        announcement_id: announcement1.announcement_id,
        content: "Will there be any group projects this semester?",
      },
      {
        user_id: student3.user_id,
        announcement_id: announcement3.announcement_id,
        content: "This sounds amazing! Will the lecture be recorded for those who can't attend?",
      },
      {
        user_id: student1.user_id,
        announcement_id: announcement4.announcement_id,
        content: "I'm very interested! What's the expected time commitment per week?",
      },
      {
        user_id: student2.user_id,
        announcement_id: announcement4.announcement_id,
        content: "Is this position open to juniors as well?",
      },
    ]);

    // Create sample subscriptions
    await db.insert(subscriptions).values([
      { user_id: student1.user_id, notify_enabled: 1 },
      { user_id: student2.user_id, notify_enabled: 1 },
      { user_id: student3.user_id, notify_enabled: 0 },
    ]);

    return NextResponse.json({
      message: "Database seeded successfully",
      data: {
        users: 5,
        announcements: 4,
        likes: 7,
        comments: 5,
        subscriptions: 3,
      },
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: String(error) },
      { status: 500 }
    );
  }
}
