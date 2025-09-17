Unique constraints

phone in contacts (so the same phone isn’t stored 5 times).

group name (unless you want multiple groups with same name).

Many-to-many join table (group_contacts_table)

Stores the membership of contacts in groups.

You can later query: all contacts in a group, or all groups a contact belongs to.

Cascade deletes

If a contact is deleted → their memberships are also deleted.

If a group is deleted → memberships are also deleted