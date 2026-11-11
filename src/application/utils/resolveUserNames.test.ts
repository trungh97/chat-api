import { hasRequiredNames, resolveUserNames } from "./resolveUserNames";

describe("resolveUserNames", () => {
  it("uses the given name as first name and the family name as last name", () => {
    expect(
      resolveUserNames({
        givenName: "Trung",
        familyName: "Hoang",
        fullName: "Trung Hoang",
        email: "trung@example.com",
      })
    ).toEqual({ firstName: "Trung", lastName: "Hoang" });
  });

  it("splits the full name when the family name is missing", () => {
    expect(
      resolveUserNames({
        givenName: "",
        familyName: undefined,
        fullName: "Quoc Trung Hoang",
        email: "trung@example.com",
      })
    ).toEqual({ firstName: "Quoc", lastName: "Trung Hoang" });
  });

  it("falls back to the email local part when names are missing", () => {
    expect(
      resolveUserNames({
        givenName: "Trung",
        familyName: null,
        fullName: "Trung",
        email: "trung.h@example.com",
      })
    ).toEqual({ firstName: "Trung", lastName: "trung.h" });

    expect(
      resolveUserNames({ givenName: "  ", email: "someone@example.com" })
    ).toEqual({ firstName: "someone", lastName: "someone" });
  });
});

describe("hasRequiredNames", () => {
  it("is false when a name is missing or blank", () => {
    expect(hasRequiredNames({ firstName: "A", lastName: "  " })).toBe(false);
    expect(hasRequiredNames({ firstName: undefined, lastName: "B" })).toBe(
      false
    );
  });

  it("is true when both names have content", () => {
    expect(hasRequiredNames({ firstName: "A", lastName: "B" })).toBe(true);
  });
});
