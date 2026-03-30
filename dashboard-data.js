(() => {
  const defaultMembers = [
    { slug: "admin", name: "Admin", role: "admin", manager_slug: null, accent_key: "accent", sort_order: 0, active: true },
    { slug: "momen", name: "Momen", role: "lead", manager_slug: "admin", accent_key: "momen", sort_order: 10, active: true },
    { slug: "sarah", name: "Sarah Hadad", role: "member", manager_slug: "momen", accent_key: "sarah", sort_order: 20, active: true },
    { slug: "hossam", name: "Hossam", role: "member", manager_slug: "momen", accent_key: "hossam", sort_order: 30, active: true },
    { slug: "ayman", name: "Ayman", role: "lead", manager_slug: "admin", accent_key: "ayman", sort_order: 40, active: true },
    { slug: "amany", name: "Amany", role: "member", manager_slug: "ayman", accent_key: "amany", sort_order: 50, active: true },
    { slug: "asmaa", name: "Asmaa", role: "member", manager_slug: "ayman", accent_key: "asmaa", sort_order: 60, active: true },
    { slug: "omar", name: "Omar", role: "member", manager_slug: "ayman", accent_key: "omar", sort_order: 70, active: true },
    { slug: "hosary", name: "Hosary", role: "lead", manager_slug: "admin", accent_key: "hosary", sort_order: 80, active: true },
    { slug: "mahmoud-feid", name: "Mahmoud Feid", role: "member", manager_slug: "hosary", accent_key: "mahmoud", sort_order: 90, active: true },
    { slug: "momen-abdelshafy", name: "Momen Abdelshafy", role: "member", manager_slug: "hosary", accent_key: "momen-abdelshafy", sort_order: 100, active: true }
  ];

  const teamMembersByLead = {
    momen: ["sarah", "hossam"],
    ayman: ["amany", "asmaa", "omar"],
    hosary: ["mahmoud-feid", "momen-abdelshafy"]
  };

  const explicitAssignments = {
    "1|Future - Engineering": ["sarah", "sarah", "hossam", "hossam"],
    "1|Future - Pharmacy": ["sarah", "sarah", "sarah", "hossam", "hossam"],
    "1|Future - Political Science": ["sarah", "sarah", "hossam", "hossam"],
    "1|Future - Business": ["sarah", "sarah", "hossam", "hossam"],
    "1|Future - Dentistry": ["sarah", "sarah", "hossam"],
    "1|Alex - Engineering B": ["sarah", "sarah", "hossam", "hossam"],
    "1|Alex - Pharmacy": ["sarah", "sarah", "hossam", "hossam"],
    "1|Damietta - Engineering": ["sarah", "hossam", "hossam"],
    "2|Alex - Pharmacy": ["sarah", "sarah", "hossam", "hossam"],
    "2|Damietta - Medicine": ["hossam"],
    "2|Future - Political Sc": ["hossam", "sarah", "sarah", "hossam"],
    "2|Future - Business": ["hossam", "sarah", "sarah", "hossam"],
    "1|Minya - Business": ["ayman", "ayman", "ayman"],
    "1|Minya - Dentistry": ["ayman", "ayman", "ayman"],
    "1|Minya - Physical Therapy": ["ayman", "ayman", "ayman"],
    "1|Sadat - Dentistry": ["ayman"],
    "1|Sadat - Physical Therapy": ["ayman"],
    "1|Smart - Eng A": ["omar", "omar", "omar", "omar"],
    "1|Smart - Eng B": ["amany", "amany"],
    "2|Minya - Business": ["ayman", "ayman"],
    "2|Minya - Dentistry": ["asmaa", "asmaa", "asmaa"],
    "2|Sadat - Dentistry": ["ayman"],
    "2|Sadat - Physical Therapy": ["ayman"],
    "2|Smart - Eng A": ["omar", "asmaa", "amany", "asmaa"],
    "1|Schools": [
      "momen-abdelshafy",
      "mahmoud-feid",
      "mahmoud-feid",
      "momen-abdelshafy",
      "mahmoud-feid",
      "momen-abdelshafy"
    ],
    "1|Sheraton - Engineering A": ["mahmoud-feid", "mahmoud-feid", "mahmoud-feid"],
    "1|Sheraton - Engineering B": ["mahmoud-feid", "mahmoud-feid", "mahmoud-feid", "mahmoud-feid"],
    "1|Sheraton - Language and Media": [
      "momen-abdelshafy",
      "momen-abdelshafy",
      "momen-abdelshafy",
      "momen-abdelshafy",
      "momen-abdelshafy"
    ],
    "1|Sheraton - Transport": ["momen-abdelshafy", "momen-abdelshafy", "momen-abdelshafy"],
    "2|Schools": [
      "momen-abdelshafy",
      "mahmoud-feid",
      "mahmoud-feid",
      "momen-abdelshafy",
      "mahmoud-feid",
      "momen-abdelshafy"
    ],
    "2|Sheraton - Language and Media": [
      "momen-abdelshafy",
      "momen-abdelshafy",
      "momen-abdelshafy",
      "momen-abdelshafy",
      "momen-abdelshafy"
    ],
    "2|Sheraton - Transport": ["mahmoud-feid", "mahmoud-feid", "mahmoud-feid", "mahmoud-feid"]
  };

  const taskBlueprints = {
    1: [
      { lead: "momen", building: "Future - Business", units: ["Basement", "1st floor", "2nd floor", "3rd floor"] },
      { lead: "momen", building: "Future - Dentistry", units: ["Ground", "1st floor", "2nd floor"] },
      { lead: "momen", building: "Future - Engineering", units: ["Ground", "1st floor", "2nd floor", "3rd floor"] },
      { lead: "momen", building: "Future - Pharmacy", units: ["Basement", "Ground", "1st floor", "2nd floor", "3rd floor"] },
      { lead: "momen", building: "Future - Political Science", units: ["Basement", "Ground", "1st floor", "2nd floor"] },
      { lead: "momen", building: "Alex - Engineering B", units: ["1st floor", "2nd floor", "3rd floor", "4th floor"] },
      { lead: "momen", building: "Alex - Pharmacy", units: ["2nd floor", "3rd floor", "4th floor", "5th floor"] },
      { lead: "momen", building: "Damietta - Engineering", units: ["2nd floor", "3rd floor", "4th floor"] },
      { lead: "ayman", building: "Minya - Business", units: ["Ground", "1st floor", "2nd floor"] },
      { lead: "ayman", building: "Minya - Dentistry", units: ["Ground", "1st floor", "2nd floor"] },
      { lead: "ayman", building: "Minya - Physical Therapy", units: ["Ground", "1st floor", "2nd floor"] },
      { lead: "ayman", building: "Sadat - Dentistry", units: ["1st floor"] },
      { lead: "ayman", building: "Sadat - Physical Therapy", units: ["1st floor"] },
      { lead: "ayman", building: "Smart - Eng A", units: ["1st floor", "3rd floor", "4th floor", "5th floor"] },
      { lead: "ayman", building: "Smart - Eng B", units: ["1st floor", "2nd floor"] },
      {
        lead: "hosary",
        building: "Schools",
        units: [
          "Al-Andalus International School",
          "El Zahraa International School",
          "Future International School",
          "Integrated Thebes American College",
          "New Vision International School",
          "Rawasy Misr International School"
        ]
      },
      { lead: "hosary", building: "Sheraton - Engineering A", units: ["1st floor", "3rd floor", "4th floor"] },
      { lead: "hosary", building: "Sheraton - Engineering B", units: ["1st floor", "2nd floor", "3rd floor", "4th floor"] },
      { lead: "hosary", building: "Sheraton - Language and Media", units: ["1st floor", "2nd floor", "3rd floor", "4th floor", "5th floor"] },
      { lead: "hosary", building: "Sheraton - Transport", units: ["2nd floor", "3rd floor", "4th floor"] }
    ],
    2: [
      { lead: "momen", building: "Alex - Pharmacy", units: ["2nd floor", "3rd floor", "4th floor", "5th floor"] },
      { lead: "momen", building: "Damietta - Medicine", units: ["1st floor"] },
      { lead: "momen", building: "Future - Business", units: ["Basement", "1st floor", "2nd floor", "3rd floor"] },
      { lead: "momen", building: "Future - Political Sc", units: ["Basement", "Ground", "1st floor", "2nd floor"] },
      { lead: "ayman", building: "Minya - Business", units: ["1st floor", "2nd floor"] },
      { lead: "ayman", building: "Minya - Dentistry", units: ["Ground", "1st floor", "2nd floor"] },
      { lead: "ayman", building: "Sadat - Dentistry", units: ["1st floor"] },
      { lead: "ayman", building: "Sadat - Physical Therapy", units: ["1st floor"] },
      {
        lead: "hosary",
        building: "Schools",
        units: [
          "Al-Andalus International School",
          "El Zahraa International School",
          "Future International School",
          "Integrated Thebes American College",
          "New Vision International School",
          "Rawasy Misr International School"
        ]
      },
      { lead: "hosary", building: "Sheraton - Language and Media", units: ["1st floor", "2nd floor", "3rd floor", "4th floor", "5th floor"] },
      { lead: "hosary", building: "Sheraton - Transport", units: ["2nd floor", "3rd floor", "4th floor", "5th floor"] },
      { lead: "ayman", building: "Smart - Eng A", units: ["1st floor", "3rd floor", "4th floor", "5th floor"] }
    ]
  };

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function createBalancedAllocator() {
    const countsByLead = Object.fromEntries(
      Object.entries(teamMembersByLead).map(([lead, members]) => [
        lead,
        Object.fromEntries(members.map((member) => [member, 0]))
      ])
    );

    return function allocateOwners(lead, count, explicitOwners) {
      if (!teamMembersByLead[lead]?.length) {
        return Array.from({ length: count }, () => "");
      }

      if (Array.isArray(explicitOwners) && explicitOwners.length) {
        explicitOwners.forEach((owner) => {
          countsByLead[lead][owner] = (countsByLead[lead][owner] || 0) + 1;
        });

        return explicitOwners;
      }

      const owners = [];
      for (let index = 0; index < count; index += 1) {
        const nextOwner = [...teamMembersByLead[lead]].sort((left, right) => {
          const delta = countsByLead[lead][left] - countsByLead[lead][right];
          return delta !== 0 ? delta : teamMembersByLead[lead].indexOf(left) - teamMembersByLead[lead].indexOf(right);
        })[0];

        countsByLead[lead][nextOwner] += 1;
        owners.push(nextOwner);
      }

      return owners;
    };
  }

  function buildSeedTasks() {
    let nextId = 1;
    const allocateOwners = createBalancedAllocator();

    return Object.entries(taskBlueprints).flatMap(([estKey, groups]) => {
      const est = Number(estKey);

      return groups.flatMap((group) => {
        const explicit = explicitAssignments[`${est}|${group.building}`];
        const owners = allocateOwners(group.lead, group.units.length, explicit);

        return group.units.map((unit, index) => ({
          id: nextId++,
          est,
          building: group.building,
          floor_name: unit,
          owner: owners[index],
          status: "todo",
          note: "",
          task_key: `${est}__${slugify(group.building)}__${slugify(unit)}__${owners[index]}`
        }));
      });
    });
  }

  window.DASHBOARD_DEFAULTS = {
    pathLabel: "EST/March-2026/files",
    members: defaultMembers,
    buildSeedTasks
  };
})();
