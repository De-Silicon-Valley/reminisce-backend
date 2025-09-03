import {
  createDepartment,
  getDepartmentBySlug,
  getDepartmentStatistics,
} from "../controllers/department.controller";
import { dataSource } from "../dataSource";

// jest mocks
jest.mock("../dataSource");

describe("department controller", () => {
  const req: any = {};
  const res: any = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("creates department when slug unique", async () => {
    req.body = { name: "Math", code: "MTH", slug: "math" };
    req.userId = "admin123";

    // mock repository behavior
    const repo: any = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockReturnValue(req.body),
      save: jest.fn().mockResolvedValue({ ...req.body }),
    };

    (dataSource as any).getRepository = jest.fn().mockReturnValue(repo);

    await createDepartment(req, res);

    expect(repo.findOne).toHaveBeenCalledWith({ where: { slug: "math" } });
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("rejects duplicate slug with 409", async () => {
    req.body = { name: "Math", code: "MTH", slug: "math" };
    req.userId = "admin123";

    const repo: any = {
      findOne: jest.fn().mockResolvedValue({ slug: "math" }),
    };

    (dataSource as any).getRepository = jest.fn().mockReturnValue(repo);

    await createDepartment(req, res);

    expect(repo.findOne).toHaveBeenCalledWith({ where: { slug: "math" } });
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("normalizes slug (trim + lowercase) before checking/creating", async () => {
    req.body = { name: "Physics", code: "PHY", slug: "  PHYSics  " };
    req.userId = "admin123";

    const repo: any = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockReturnValue({}),
      save: jest.fn().mockResolvedValue({ slug: "physics" }),
    };

    (dataSource as any).getRepository = jest.fn().mockReturnValue(repo);

    await createDepartment(req, res);

    expect(repo.findOne).toHaveBeenCalledWith({ where: { slug: "physics" } });
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "physics" })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("getDepartmentBySlug returns 200 with dept when found", async () => {
    const req2: any = { params: { slug: "math" } };
    const res2: any = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    const deptObj = { name: "Math", slug: "math" };
    const repo: any = {
      findOne: jest.fn().mockResolvedValue(deptObj),
    };

    (dataSource as any).getRepository = jest.fn().mockReturnValue(repo);

    await getDepartmentBySlug(req2, res2);

    expect(repo.findOne).toHaveBeenCalledWith({ where: { slug: "math" } });
    expect(res2.status).toHaveBeenCalledWith(200);
    expect(res2.send).toHaveBeenCalledWith(deptObj);
  });

  test("getDepartmentBySlug returns 404 when not found", async () => {
    const req3: any = { params: { slug: "unknown" } };
    const res3: any = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    const repo: any = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    (dataSource as any).getRepository = jest.fn().mockReturnValue(repo);

    await getDepartmentBySlug(req3, res3);

    expect(repo.findOne).toHaveBeenCalledWith({ where: { slug: "unknown" } });
    expect(res3.status).toHaveBeenCalledWith(404);
  });

  test("getDepartmentStatistics returns 404 when department not found", async () => {
    const req4: any = { params: { slug: "unknown" } };
    const res4: any = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    const repo: any = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    (dataSource as any).getRepository = jest.fn().mockReturnValue(repo);

    await getDepartmentStatistics(req4, res4);

    expect(repo.findOne).toHaveBeenCalledWith({ where: { slug: "unknown" } });
    expect(res4.status).toHaveBeenCalledWith(404);
  });

  test("getDepartmentStatistics returns statistics when department found", async () => {
    const req5: any = { params: { slug: "math" } };
    const res5: any = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    const deptObj = { name: "Math Department", code: "MTH", slug: "math" };
    const deptRepo: any = {
      findOne: jest.fn().mockResolvedValue(deptObj),
    };

    const studentRepo: any = {
      count: jest.fn().mockResolvedValue(25),
    };

    const eventRepo: any = {
      count: jest.fn().mockResolvedValue(5),
    };

    const albumRepo: any = {
      count: jest.fn().mockResolvedValue(8),
      find: jest.fn().mockResolvedValue([
        { albumName: "Album 1" },
        { albumName: "Album 2" },
        { albumName: "Album 3" }
      ]),
    };

    const imageRepo: any = {
      count: jest.fn().mockResolvedValue(150),
    };

    (dataSource as any).getRepository = jest.fn()
      .mockReturnValueOnce(deptRepo)    // Department
      .mockReturnValueOnce(studentRepo) // Student
      .mockReturnValueOnce(eventRepo)   // Event (ongoing + upcoming)
      .mockReturnValueOnce(albumRepo)   // Album
      .mockReturnValueOnce(albumRepo)   // Album (find)
      .mockReturnValueOnce(imageRepo);  // Image (with In operator)

    await getDepartmentStatistics(req5, res5);

    expect(deptRepo.findOne).toHaveBeenCalledWith({ where: { slug: "math" } });
    expect(res5.status).toHaveBeenCalledWith(200);
    expect(res5.send).toHaveBeenCalledWith({
      department: {
        name: "Math Department",
        code: "MTH",
        slug: "math"
      },
      statistics: {
        totalUsers: 25,
        activeEvents: 5, // Single query for ongoing + upcoming
        totalAlbums: 8,
        totalImages: 150 // Single query with In operator
      }
    });
  });
});
