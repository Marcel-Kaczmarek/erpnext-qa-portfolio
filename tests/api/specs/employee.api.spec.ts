import { test, expect, APIRequestContext } from "@playwright/test";
import { createApiContext, resourceUrl } from "../helpers/apiClient";
import { uniqueName, pastDate } from "../../../fixtures/testData";

let api: APIRequestContext;

test.beforeAll(async () => {
  api = await createApiContext();
});

test.afterAll(async () => {
  await api.dispose();
});

test.describe("Employee API", () => {
  test("creates, reads, updates, and deletes an employee", async () => {
    const firstName = uniqueName("API-Employee");

    const createResp = await api.post(resourceUrl("Employee"), {
      data: {
        first_name: firstName,
        date_of_joining: pastDate(30),
        date_of_birth: pastDate(365 * 25),
        gender: "Male",
      },
    });
    expect(createResp.status()).toBe(200);
    const created = await createResp.json();
    const employeeId = created.data.name;

    const getResp = await api.get(resourceUrl("Employee", employeeId));
    expect(getResp.status()).toBe(200);

    const updateResp = await api.put(resourceUrl("Employee", employeeId), {
      data: { gender: "Female" },
    });
    expect(updateResp.status()).toBe(200);
    const updated = await updateResp.json();
    expect(updated.data.gender).toBe("Female");

    const deleteResp = await api.delete(resourceUrl("Employee", employeeId));
    expect([200, 202]).toContain(deleteResp.status());
  });

  test("rejects an employee created without a date of birth", async () => {
    const resp = await api.post(resourceUrl("Employee"), {
      data: { first_name: uniqueName("API-Employee"), date_of_joining: pastDate(30) },
    });
    expect(resp.status()).toBeGreaterThanOrEqual(400);
  });
});
