export interface ResolveUserNamesInput {
  givenName?: string | null;
  familyName?: string | null;
  fullName?: string | null;
  email: string;
}

export interface ResolvedUserNames {
  firstName: string;
  lastName: string;
}

const clean = (value?: string | null): string => value?.trim() ?? "";

/**
 * Picks a non-empty first and last name for a user from an identity provider profile.
 *
 * Uses the given and family names when present. A missing part is taken from the
 * full name (first word, or the remaining words), and then from the part of the
 * email before the @.
 */
export const resolveUserNames = ({
  givenName,
  familyName,
  fullName,
  email,
}: ResolveUserNamesInput): ResolvedUserNames => {
  const emailName = clean(email.split("@")[0]) || email;
  const [firstWord = "", ...otherWords] = clean(fullName)
    .split(/\s+/)
    .filter(Boolean);
  const rest = otherWords.join(" ");

  const firstName = clean(givenName) || firstWord || emailName;
  const lastName = clean(familyName) || rest || emailName;

  return { firstName, lastName };
};

/**
 * Checks that both names contain at least one non-whitespace character.
 */
export const hasRequiredNames = ({
  firstName,
  lastName,
}: {
  firstName?: string | null;
  lastName?: string | null;
}): boolean => !!clean(firstName) && !!clean(lastName);
