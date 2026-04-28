import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Seeding database...');

  // ── University ─────────────────────────────────────────────
  const university = await prisma.university.upsert({
    where: { domain: 'demo.university.edu' },
    update: {},
    create: {
      name: 'Demo University',
      domain: 'demo.university.edu',
      dataRegion: 'US',
      defaultTimezone: 'America/New_York',
    },
  });
  console.log(`  ✓ University: ${university.name}`);

  // ── System Policy ──────────────────────────────────────────
  const systemPolicy = await prisma.systemPolicy.upsert({
    where: { universityId: university.id },
    update: {},
    create: {
      universityId: university.id,
      maxResubmissionsPerAssignment: 5,
      maxFileSizeMb: 50,
      maxMonthlySpendPerCourseUsd: 500,
      defaultLocale: 'en',
      defaultAutoReleaseConfidenceThreshold: 0.9,
    },
  });
  console.log(`  ✓ System Policy created`);

  // ── Retention Policy ───────────────────────────────────────
  await prisma.retentionPolicy.upsert({
    where: { universityId: university.id },
    update: {},
    create: {
      universityId: university.id,
      submissionRetentionYears: 7,
      feedbackRetentionYears: 7,
      followupChatRetentionYears: 2,
      modelCallLogRetentionMonths: 24,
      auditLogRetentionYears: 7,
      rawSubmissionFileRetentionYears: 2,
    },
  });
  console.log(`  ✓ Retention Policy created`);

  // ── School ─────────────────────────────────────────────────
  const school = await prisma.school.upsert({
    where: { universityId_code: { universityId: university.id, code: 'ENG' } },
    update: {},
    create: {
      universityId: university.id,
      name: 'School of Engineering',
      code: 'ENG',
    },
  });
  console.log(`  ✓ School: ${school.name}`);

  // ── Super Admin ────────────────────────────────────────────
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@platform.local' },
    update: {},
    create: {
      email: 'admin@platform.local',
      passwordHash: hashPassword('SuperAdmin123!'),
      name: 'Platform Super Admin',
      systemRole: 'SUPER_ADMIN',
      twoFaEnabled: true,
      locale: 'en',
    },
  });
  console.log(`  ✓ Super Admin: ${superAdmin.email}`);

  // ── Platform Config (singleton) ────────────────────────────
  await prisma.platformConfig.upsert({
    where: { id: 'platform' },
    update: {},
    create: {
      id: 'platform',
      superAdminUserId: superAdmin.id,
      gradingModelFamily: 'gpt-5.4',
      gradingModelSnapshot: 'gpt-5.4-2026-03-15',
      followUpChatModelFamily: 'gpt-5.4',
      followUpChatModelSnapshot: 'gpt-5.4-2026-03-15',
      auxiliaryModelFamily: 'gpt-4o-mini',
      auxiliaryModelSnapshot: 'gpt-4o-mini-2024-07-18',
      embedderModel: 'voyage-3',
      rerankerModel: 'rerank-v3.5',
    },
  });
  console.log(`  ✓ Platform Config created`);

  // ── University Admin ───────────────────────────────────────
  const univAdmin = await prisma.user.upsert({
    where: { email: 'admin@demo.university.edu' },
    update: {},
    create: {
      universityId: university.id,
      email: 'admin@demo.university.edu',
      passwordHash: hashPassword('UnivAdmin123!'),
      name: 'University Administrator',
      systemRole: 'UNIV_ADMIN',
      twoFaEnabled: true,
      locale: 'en',
    },
  });
  console.log(`  ✓ University Admin: ${univAdmin.email}`);

  // ── Professors ─────────────────────────────────────────────
  const prof1 = await prisma.user.upsert({
    where: { email: 'prof.smith@demo.university.edu' },
    update: {},
    create: {
      universityId: university.id,
      email: 'prof.smith@demo.university.edu',
      passwordHash: hashPassword('Professor123!'),
      name: 'Prof. Sarah Smith',
      systemRole: 'STUDENT', // systemRole is STUDENT; course role is via RoleAssignment
      locale: 'en',
    },
  });

  const prof2 = await prisma.user.upsert({
    where: { email: 'prof.chen@demo.university.edu' },
    update: {},
    create: {
      universityId: university.id,
      email: 'prof.chen@demo.university.edu',
      passwordHash: hashPassword('Professor123!'),
      name: 'Prof. Wei Chen',
      systemRole: 'STUDENT',
      locale: 'en',
    },
  });
  console.log(`  ✓ Professors: ${prof1.name}, ${prof2.name}`);

  // ── Students ───────────────────────────────────────────────
  const students = [];
  for (let i = 1; i <= 5; i++) {
    const student = await prisma.user.upsert({
      where: { email: `student${i}@demo.university.edu` },
      update: {},
      create: {
        universityId: university.id,
        email: `student${i}@demo.university.edu`,
        passwordHash: hashPassword(`Student${i}123!`),
        name: `Student ${i}`,
        systemRole: 'STUDENT',
        locale: 'en',
      },
    });
    students.push(student);
  }
  console.log(`  ✓ Students: ${students.length} created`);

  // ── Courses ────────────────────────────────────────────────
  const course1 = await prisma.course.upsert({
    where: { schoolId_code_term: { schoolId: school.id, code: 'CS101', term: 'Fall2026' } },
    update: {},
    create: {
      schoolId: school.id,
      code: 'CS101',
      title: 'Introduction to Computer Science',
      term: 'Fall2026',
      headOfCourseId: prof1.id,
      releaseDefault: 'HOLD_FOR_APPROVAL',
      resubmissionDefault: 2,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { schoolId_code_term: { schoolId: school.id, code: 'MATH201', term: 'Fall2026' } },
    update: {},
    create: {
      schoolId: school.id,
      code: 'MATH201',
      title: 'Linear Algebra',
      term: 'Fall2026',
      headOfCourseId: prof2.id,
      releaseDefault: 'HOLD_FOR_APPROVAL',
      resubmissionDefault: 1,
    },
  });
  console.log(`  ✓ Courses: ${course1.title}, ${course2.title}`);

  // ── Role Assignments ───────────────────────────────────────
  await prisma.roleAssignment.upsert({
    where: {
      userId_role_scopeType_scopeId: {
        userId: prof1.id,
        role: 'PROFESSOR',
        scopeType: 'COURSE',
        scopeId: course1.id,
      },
    },
    update: {},
    create: {
      userId: prof1.id,
      role: 'PROFESSOR',
      scopeType: 'COURSE',
      scopeId: course1.id,
    },
  });

  await prisma.roleAssignment.upsert({
    where: {
      userId_role_scopeType_scopeId: {
        userId: prof2.id,
        role: 'PROFESSOR',
        scopeType: 'COURSE',
        scopeId: course2.id,
      },
    },
    update: {},
    create: {
      userId: prof2.id,
      role: 'PROFESSOR',
      scopeType: 'COURSE',
      scopeId: course2.id,
    },
  });

  await prisma.roleAssignment.upsert({
    where: {
      userId_role_scopeType_scopeId: {
        userId: prof1.id,
        role: 'HEAD_OF_COURSE',
        scopeType: 'COURSE',
        scopeId: course1.id,
      },
    },
    update: {},
    create: {
      userId: prof1.id,
      role: 'HEAD_OF_COURSE',
      scopeType: 'COURSE',
      scopeId: course1.id,
    },
  });
  console.log(`  ✓ Role Assignments created`);

  // ── Enrollments ────────────────────────────────────────────
  for (const student of students) {
    await prisma.enrollment.upsert({
      where: {
        courseId_studentId: { courseId: course1.id, studentId: student.id },
      },
      update: {},
      create: {
        courseId: course1.id,
        studentId: student.id,
        status: 'ACTIVE',
      },
    });

    // Enroll first 3 students in course2
    if (students.indexOf(student) < 3) {
      await prisma.enrollment.upsert({
        where: {
          courseId_studentId: { courseId: course2.id, studentId: student.id },
        },
        update: {},
        create: {
          courseId: course2.id,
          studentId: student.id,
          status: 'ACTIVE',
        },
      });
    }
  }
  console.log(`  ✓ Enrollments created`);

  // ── Retrieval Config ───────────────────────────────────────
  const retrievalConfig = await prisma.retrievalConfig.create({
    data: {
      embedderModel: 'voyage-3',
      embedderVersion: '1.0',
      rerankerModel: 'rerank-v3.5',
      rerankerVersion: '1.0',
      rrfKWeight: 60,
      chunkStrategyVersion: '1.0',
    },
  });
  console.log(`  ✓ Retrieval Config created`);

  // ── Course Materials ───────────────────────────────────────
  const material1 = await prisma.courseMaterial.create({
    data: {
      courseId: course1.id,
      title: 'Week 1 - Introduction to Programming',
      kind: 'PDF',
      storageKey: 'materials/cs101/week1-intro.pdf',
      weekTag: 1,
      topicTags: ['variables', 'types', 'operators'],
      sectionTreeJson: {
        title: 'Introduction to Programming',
        children: [
          { title: 'Variables and Types', page: 3 },
          { title: 'Basic Operators', page: 12 },
          { title: 'Control Flow', page: 20 },
        ],
      },
    },
  });

  const material2 = await prisma.courseMaterial.create({
    data: {
      courseId: course1.id,
      title: 'Week 2 - Functions and Modules',
      kind: 'PDF',
      storageKey: 'materials/cs101/week2-functions.pdf',
      weekTag: 2,
      topicTags: ['functions', 'modules', 'scope'],
      sectionTreeJson: {
        title: 'Functions and Modules',
        children: [
          { title: 'Defining Functions', page: 2 },
          { title: 'Parameters and Return Values', page: 8 },
          { title: 'Modules and Imports', page: 15 },
        ],
      },
    },
  });

  const material3 = await prisma.courseMaterial.create({
    data: {
      courseId: course2.id,
      title: 'Week 1 - Vectors and Matrices',
      kind: 'PDF',
      storageKey: 'materials/math201/week1-vectors.pdf',
      weekTag: 1,
      topicTags: ['vectors', 'matrices', 'linear_combinations'],
    },
  });
  console.log(`  ✓ Course Materials: 3 created`);

  // ── Material Chunks (sample) ───────────────────────────────
  const parentChunk1 = await prisma.materialChunk.create({
    data: {
      materialId: material1.id,
      chunkIndex: 0,
      text: 'Variables are containers for storing data values. In Python, a variable is created the moment you first assign a value to it. Python has no command for declaring a variable. Variables can store different types of data, including integers, floating-point numbers, strings, and booleans. Understanding variable types is fundamental to programming.',
      weekTag: 1,
      chunkLevel: 'PARENT',
      sectionHeadingPath: 'Introduction to Programming > Variables and Types',
      pageNumber: 3,
      startChar: 0,
      endChar: 380,
      chunkType: 'PROSE',
      conceptIds: [],
      retrievalConfigId: retrievalConfig.id,
    },
  });

  await prisma.materialChunk.create({
    data: {
      materialId: material1.id,
      chunkIndex: 1,
      text: 'Variables are containers for storing data values. In Python, a variable is created the moment you first assign a value to it.',
      weekTag: 1,
      chunkLevel: 'CHILD',
      parentChunkId: parentChunk1.id,
      sectionHeadingPath: 'Introduction to Programming > Variables and Types',
      pageNumber: 3,
      startChar: 0,
      endChar: 120,
      chunkType: 'PROSE',
      conceptIds: [],
      retrievalConfigId: retrievalConfig.id,
    },
  });

  await prisma.materialChunk.create({
    data: {
      materialId: material1.id,
      chunkIndex: 2,
      text: 'Python has no command for declaring a variable. Variables can store different types of data, including integers, floating-point numbers, strings, and booleans. Understanding variable types is fundamental to programming.',
      weekTag: 1,
      chunkLevel: 'CHILD',
      parentChunkId: parentChunk1.id,
      sectionHeadingPath: 'Introduction to Programming > Variables and Types',
      pageNumber: 3,
      startChar: 120,
      endChar: 380,
      chunkType: 'PROSE',
      conceptIds: [],
      retrievalConfigId: retrievalConfig.id,
    },
  });

  const parentChunk2 = await prisma.materialChunk.create({
    data: {
      materialId: material1.id,
      chunkIndex: 3,
      text: 'Functions are reusable blocks of code that perform a specific task. They help organize code, reduce repetition, and make programs easier to understand. A function is defined using the def keyword, followed by the function name and parentheses containing any parameters. The function body is indented below the definition.',
      weekTag: 2,
      chunkLevel: 'PARENT',
      sectionHeadingPath: 'Introduction to Programming > Control Flow',
      pageNumber: 20,
      startChar: 1200,
      endChar: 1550,
      chunkType: 'PROSE',
      conceptIds: [],
      retrievalConfigId: retrievalConfig.id,
    },
  });
  console.log(`  ✓ Material Chunks: 4 created`);

  // ── Concepts ───────────────────────────────────────────────
  const concept1 = await prisma.concept.upsert({
    where: { courseId_name: { courseId: course1.id, name: 'Variables' } },
    update: {},
    create: {
      courseId: course1.id,
      name: 'Variables',
      introducedInWeek: 1,
    },
  });

  const concept2 = await prisma.concept.upsert({
    where: { courseId_name: { courseId: course1.id, name: 'Data Types' } },
    update: {},
    create: {
      courseId: course1.id,
      name: 'Data Types',
      introducedInWeek: 1,
    },
  });

  const concept3 = await prisma.concept.upsert({
    where: { courseId_name: { courseId: course1.id, name: 'Functions' } },
    update: {},
    create: {
      courseId: course1.id,
      name: 'Functions',
      introducedInWeek: 2,
    },
  });
  console.log(`  ✓ Concepts: 3 created`);

  // ── Rubrics ────────────────────────────────────────────────
  const rubric1 = await prisma.rubric.create({
    data: {
      courseId: course1.id,
      title: 'CS101 HW1 Rubric',
      reusable: false,
    },
  });

  const rubricVersion1 = await prisma.rubricVersion.create({
    data: {
      rubricId: rubric1.id,
      versionNumber: 1,
      criteria: [
        {
          id: 'c1',
          name: 'Correctness',
          weight: 40,
          maxPoints: 40,
          description: 'Code produces correct output for all test cases',
          levels: [
            { name: 'Exemplary', points: 40, description: 'All test cases pass' },
            { name: 'Proficient', points: 30, description: 'Most test cases pass' },
            { name: 'Developing', points: 20, description: 'Some test cases pass' },
            { name: 'Beginning', points: 10, description: 'Few test cases pass' },
          ],
        },
        {
          id: 'c2',
          name: 'Code Style',
          weight: 30,
          maxPoints: 30,
          description: 'Code follows PEP 8 conventions and is well-structured',
          levels: [
            { name: 'Exemplary', points: 30, description: 'Clean, well-documented code' },
            { name: 'Proficient', points: 20, description: 'Mostly clean code' },
            { name: 'Developing', points: 10, description: 'Some style issues' },
          ],
        },
        {
          id: 'c3',
          name: 'Problem Understanding',
          weight: 30,
          maxPoints: 30,
          description: 'Demonstrates understanding of the underlying concepts',
          levels: [
            { name: 'Exemplary', points: 30, description: 'Deep understanding shown' },
            { name: 'Proficient', points: 20, description: 'Good understanding' },
            { name: 'Developing', points: 10, description: 'Partial understanding' },
          ],
        },
      ],
      createdById: prof1.id,
    },
  });

  await prisma.rubric.update({
    where: { id: rubric1.id },
    data: { latestVersionId: rubricVersion1.id },
  });

  const rubric2 = await prisma.rubric.create({
    data: {
      courseId: course2.id,
      title: 'MATH201 HW1 Rubric',
      reusable: false,
    },
  });

  const rubricVersion2 = await prisma.rubricVersion.create({
    data: {
      rubricId: rubric2.id,
      versionNumber: 1,
      criteria: [
        {
          id: 'mc1',
          name: 'Mathematical Correctness',
          weight: 50,
          maxPoints: 50,
          description: 'Solutions are mathematically correct',
        },
        {
          id: 'mc2',
          name: 'Proof Structure',
          weight: 30,
          maxPoints: 30,
          description: 'Proofs follow logical structure',
        },
        {
          id: 'mc3',
          name: 'Notation',
          weight: 20,
          maxPoints: 20,
          description: 'Uses proper mathematical notation',
        },
      ],
      createdById: prof2.id,
    },
  });

  await prisma.rubric.update({
    where: { id: rubric2.id },
    data: { latestVersionId: rubricVersion2.id },
  });
  console.log(`  ✓ Rubrics: 2 created with versions`);

  // ── Assignments ────────────────────────────────────────────
  const assignment1 = await prisma.assignment.create({
    data: {
      courseId: course1.id,
      title: 'HW1: Variables and Basic Operations',
      instructions:
        'Write a Python program that demonstrates understanding of variables, data types, and basic operations. Include at least one example of each data type (int, float, str, bool).',
      dueAt: new Date('2026-09-15T23:59:00Z'),
      rubricId: rubric1.id,
      availableFromWeek: 1,
      assignmentType: 'CODE',
      autoReleaseEnabled: false,
      autoReleaseConfidenceThreshold: 0.9,
      maxResubmissions: 2,
      publishedAt: new Date('2026-09-01T00:00:00Z'),
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      courseId: course2.id,
      title: 'HW1: Vector Spaces and Linear Transformations',
      instructions:
        'Solve the following problems on vector spaces and linear transformations. Show all work and justify each step.',
      dueAt: new Date('2026-09-20T23:59:00Z'),
      rubricId: rubric2.id,
      availableFromWeek: 1,
      assignmentType: 'MATH',
      autoReleaseEnabled: false,
      autoReleaseConfidenceThreshold: 0.9,
      maxResubmissions: 1,
      publishedAt: new Date('2026-09-05T00:00:00Z'),
    },
  });
  console.log(`  ✓ Assignments: 2 created`);

  // ── Assignment Prerequisites ───────────────────────────────
  await prisma.assignmentPrerequisite.create({
    data: {
      assignmentId: assignment1.id,
      refType: 'MATERIAL',
      refId: material1.id,
      note: 'Students should have read the Week 1 lecture notes',
    },
  });
  console.log(`  ✓ Assignment Prerequisites created`);

  console.log('\n✅ Database seeded successfully!');
  console.log('\nSeeded accounts:');
  console.log('  Super Admin: admin@platform.local / SuperAdmin123!');
  console.log('  Univ Admin:  admin@demo.university.edu / UnivAdmin123!');
  console.log('  Professor 1: prof.smith@demo.university.edu / Professor123!');
  console.log('  Professor 2: prof.chen@demo.university.edu / Professor123!');
  console.log('  Students:    student1-5@demo.university.edu / Student[N]123!');
}

main()
  .catch((e: any) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
