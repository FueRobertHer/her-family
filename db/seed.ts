import { db, Comments, MemorialContent, GalleryImages, Memorials } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
  const now = new Date().toISOString();
  const defaultMemorialSlug = 'founder-memorial';

  console.log('Seeding memorials...');
  const memorialInsert = await db.insert(Memorials).values({
    slug: defaultMemorialSlug,
    name: 'Founder Memorial',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  });
  const memorialId = Number(memorialInsert.lastInsertRowid);

  // Insert memorial content
  console.log('Seeding memorial content...');
  const memorialContentSeed = [
    // Hero Section
    { section: 'hero', key: 'name', value: 'Full Name', type: 'text', updatedAt: now },
    { section: 'hero', key: 'birthDate', value: '1965-03-15', type: 'date', updatedAt: now },
    { section: 'hero', key: 'deathDate', value: '2024-01-10', type: 'date', updatedAt: now },
    { section: 'hero', key: 'subtitle', value: 'In Loving Memory', type: 'text', updatedAt: now },
    {
      section: 'hero',
      key: 'mainImage',
      value: '/images/portrait.jpg',
      type: 'image',
      updatedAt: now,
    },

    // Biography Section
    {
      section: 'biography',
      key: 'title',
      value: 'Remembering a Beautiful Life',
      type: 'text',
      updatedAt: now,
    },
    {
      section: 'biography',
      key: 'content',
      value: `A beacon of light in the community, dedicating decades to making a positive impact. With a passion for learning and helping others that would define an entire life.

After pursuing education and building a career, years were spent inspiring and helping others. Known for warmth, creativity, and the genuine care shown to each person.

A devoted family member and loving friend. An incredible gift for making everyone feel valued and heard, whether it was someone struggling, a new neighbor, or a friend in need.

This legacy lives on through the many people inspired, the family loved deeply, and the community served with such dedication and grace.`,
      type: 'textarea',
      updatedAt: now,
    },
    {
      section: 'biography',
      key: 'highlights',
      value: JSON.stringify([
        'Dedicated to making a positive impact',
        'Organized community events and charitable causes',
        'Mentored and helped many people throughout life',
        'Volunteered regularly for important causes',
        'Known for warmth and generosity',
        'Created programs that helped the community',
      ]),
      type: 'json',
      updatedAt: now,
    },

    // Video Section
    {
      section: 'video',
      key: 'sectionTitle',
      value: 'A Life Remembered',
      type: 'text',
      updatedAt: now,
    },
    {
      section: 'video',
      key: 'description',
      value: 'A collection of memories and messages from family and friends',
      type: 'text',
      updatedAt: now,
    },
    {
      section: 'video',
      key: 'videoUrl',
      value: '/videos/memorial-video.mp4',
      type: 'text',
      updatedAt: now,
    },
    {
      section: 'video',
      key: 'posterImage',
      value: '/images/video-poster.jpg',
      type: 'image',
      updatedAt: now,
    },

    // Donations Section
    {
      section: 'donations',
      key: 'venmoUsername',
      value: '@memorial',
      type: 'text',
      updatedAt: now,
    },
    {
      section: 'donations',
      key: 'paypalEmail',
      value: 'memorial@example.com',
      type: 'text',
      updatedAt: now,
    },
    {
      section: 'donations',
      key: 'cashappUsername',
      value: '$memorial',
      type: 'text',
      updatedAt: now,
    },
    {
      section: 'donations',
      key: 'zelleEmail',
      value: 'memorial@example.com',
      type: 'text',
      updatedAt: now,
    },
    {
      section: 'donations',
      key: 'subtitle',
      value: 'Support the family during this difficult time',
      type: 'text',
      updatedAt: now,
    },
    {
      section: 'donations',
      key: 'customMessage',
      value:
        'Your generous donations help honor their memory and support their family during this difficult time.',
      type: 'textarea',
      updatedAt: now,
    },

    // Comments Section
    {
      section: 'comments',
      key: 'sectionTitle',
      value: 'Share Your Memories',
      type: 'text',
      updatedAt: now,
    },
    {
      section: 'comments',
      key: 'subtitle',
      value: 'Leave a message to honor their memory and share how they touched your life',
      type: 'text',
      updatedAt: now,
    },
    { section: 'comments', key: 'autoApprove', value: 'false', type: 'boolean', updatedAt: now },

    // Funeral Section
    {
      section: 'funeral',
      key: 'subtitle',
      value: 'Please join us as we celebrate their life and honor their memory',
      type: 'text',
      updatedAt: now,
    },
    {
      section: 'funeral',
      key: 'specialInstructions',
      value:
        'Please arrive 15 minutes early for seating. The funeral service will be livestreamed for those unable to attend in person. A link will be provided to family members.',
      type: 'textarea',
      updatedAt: now,
    },
    {
      section: 'funeral',
      key: 'flowersInfo',
      value:
        'In lieu of flowers, the family requests donations be made to a charity of your choice.',
      type: 'textarea',
      updatedAt: now,
    },

    // Funeral Services (stored as JSON)
    {
      section: 'funeral',
      key: 'service0',
      value: JSON.stringify({
        type: 'Viewing & Visitation',
        date: '2024-01-15',
        time: '14:00',
        location: {
          name: 'Peaceful Rest Funeral Home',
          address: '123 Memorial Drive, Springfield, IL 62701',
          phone: '(217) 555-0123',
          website: 'https://peacefulrest.com',
        },
        description: 'Family and friends are invited to pay their respects and share memories.',
        dresscode: 'Business casual or formal attire',
      }),
      type: 'json',
      updatedAt: now,
    },
    {
      section: 'funeral',
      key: 'service1',
      value: JSON.stringify({
        type: 'Funeral Service',
        date: '2024-01-16',
        time: '11:00',
        location: {
          name: "St. Mary's Cathedral",
          address: '456 Church Street, Springfield, IL 62701',
          phone: '(217) 555-0456',
          website: 'https://stmaryscathedral.org',
        },
        description: 'A celebration of life with readings, music, and remembrances.',
        dresscode: 'Formal attire preferred',
      }),
      type: 'json',
      updatedAt: now,
    },
  ];
  await db
    .insert(MemorialContent)
    .values(memorialContentSeed.map((item) => ({ ...item, memorialId })));

  // Insert gallery images
  console.log('Seeding gallery images...');
  const gallerySeed = [
    {
      imagePath: '/images/gallery1.jpg',
      caption: 'A cherished memory',
      displayOrder: 1,
      isActive: true,
      uploadedAt: now,
    },
    {
      imagePath: '/images/gallery2.jpg',
      caption: 'Family vacation',
      displayOrder: 2,
      isActive: true,
      uploadedAt: now,
    },
    {
      imagePath: '/images/gallery3.jpg',
      caption: 'Special celebration',
      displayOrder: 3,
      isActive: true,
      uploadedAt: now,
    },
    {
      imagePath: '/images/gallery4.jpg',
      caption: 'An important milestone',
      displayOrder: 4,
      isActive: true,
      uploadedAt: now,
    },
    {
      imagePath: '/images/gallery5.jpg',
      caption: 'Quality time with family',
      displayOrder: 5,
      isActive: true,
      uploadedAt: now,
    },
    {
      imagePath: '/images/gallery6.jpg',
      caption: 'Celebrating life',
      displayOrder: 6,
      isActive: true,
      uploadedAt: now,
    },
  ];
  await db.insert(GalleryImages).values(gallerySeed.map((item) => ({ ...item, memorialId })));

  // Insert sample comments for demonstration
  console.log('Seeding comments...');
  const commentsSeed = [
    {
      name: 'Former Colleague',
      relationship: 'Colleague',
      message:
        "Such an inspiration to all of us. The dedication was unmatched, and the warm smile could brighten anyone's day. Will be deeply missed.",
      status: 'approved',
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Community Member',
      relationship: 'Community Member',
      message:
        'Made such a positive impact on so many lives. Had a gift for making everyone feel special and valued. Our community will never forget their kindness.',
      status: 'approved',
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Friend',
      relationship: 'Neighbor',
      message:
        'Was the heart of our neighborhood. Always ready to help, always with a kind word. Made everyone feel like family. Rest in peace, dear friend.',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    },
    {
      name: 'Grateful Person',
      relationship: 'Acquaintance',
      message:
        "I still remember years ago how much of a positive impact was made on my life. Believed in me when I didn't believe in myself. Thank you for everything.",
      status: 'approved',
      createdAt: now,
      updatedAt: now,
    },
  ];
  await db.insert(Comments).values(commentsSeed.map((item) => ({ ...item, memorialId })));

  console.log('Seeding complete!');
}
