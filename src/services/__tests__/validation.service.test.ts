import { ValidationService } from "../validation.service";
import {
  createMockContext,
  createTestDemonstrativoRecord,
  createTestCBHPMEntry,
} from "../../test/setup";
import { Role } from "../../domain/models";
import { CBHPMError } from "../../errors";

describe("ValidationService", () => {
  const mockContext = createMockContext();
  let validationService: ValidationService;

  beforeEach(() => {
    validationService = new ValidationService(mockContext.prisma);
  });

  describe("validateRecords", () => {
    it("should validate a record with matching CBHPM values", async () => {
      // Arrange
      const record = createTestDemonstrativoRecord();
      const cbhpmEntry = createTestCBHPMEntry();

      mockContext.prisma.cBHPMProcedure.findUnique.mockResolvedValue(
        cbhpmEntry,
      );

      // Act
      const results = await validationService.validateRecords([record], {
        tolerancePercentage: 5,
        requireExactMatch: false,
        allowMissingCodes: false,
      });

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].isValid).toBe(true);
      expect(results[0].errors).toHaveLength(0);
      expect(results[0].difference).toBe(-50); // 950 - 1000
    });

    it("should mark record as invalid when outside tolerance", async () => {
      // Arrange
      const record = {
        ...createTestDemonstrativoRecord(),
        approvedValue: 500.0, // 50% less than expected
      };
      const cbhpmEntry = createTestCBHPMEntry();

      mockContext.prisma.cBHPMProcedure.findUnique.mockResolvedValue(
        cbhpmEntry,
      );

      // Act
      const results = await validationService.validateRecords([record], {
        tolerancePercentage: 5,
        requireExactMatch: false,
        allowMissingCodes: false,
      });

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].isValid).toBe(false);
      expect(results[0].errors).toHaveLength(1);
      expect(results[0].errors[0]).toContain("exceeds tolerance");
    });

    it("should handle missing CBHPM codes when allowed", async () => {
      // Arrange
      const record = createTestDemonstrativoRecord();
      mockContext.prisma.cBHPMProcedure.findUnique.mockResolvedValue(null);

      // Act
      const results = await validationService.validateRecords([record], {
        tolerancePercentage: 5,
        requireExactMatch: false,
        allowMissingCodes: true,
      });

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].isValid).toBe(false);
      expect(results[0].errors).toHaveLength(1);
      expect(results[0].errors[0]).toContain("No CBHPM entry found");
    });

    it("should throw error for missing CBHPM codes when not allowed", async () => {
      // Arrange
      const record = createTestDemonstrativoRecord();
      mockContext.prisma.cBHPMProcedure.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        validationService.validateRecords([record], {
          tolerancePercentage: 5,
          requireExactMatch: false,
          allowMissingCodes: false,
        }),
      ).rejects.toThrow(CBHPMError);
    });

    it("should validate multiple records correctly", async () => {
      // Arrange
      const records = [
        createTestDemonstrativoRecord(),
        {
          ...createTestDemonstrativoRecord(),
          code: "30602204",
          role: Role.ANESTHETIST,
          approvedValue: 300.0,
        },
      ];

      const cbhpmEntry = createTestCBHPMEntry();
      mockContext.prisma.cBHPMProcedure.findUnique.mockResolvedValue(
        cbhpmEntry,
      );

      // Act
      const results = await validationService.validateRecords(records, {
        tolerancePercentage: 5,
        requireExactMatch: false,
        allowMissingCodes: false,
      });

      // Assert
      expect(results).toHaveLength(2);
      expect(results.filter((r) => r.isValid)).toHaveLength(2);
    });
  });

  describe("getValidationSummary", () => {
    it("should generate correct summary statistics", async () => {
      // Arrange
      const results = [
        {
          record: createTestDemonstrativoRecord(),
          expectedValue: 1000,
          difference: -50,
          isValid: true,
          errors: [],
        },
        {
          record: createTestDemonstrativoRecord(),
          expectedValue: 1000,
          difference: -500,
          isValid: false,
          errors: ["Value difference exceeds tolerance"],
        },
      ];

      // Act
      const summary = await validationService.getValidationSummary(results);

      // Assert
      expect(summary.totalRecords).toBe(2);
      expect(summary.validRecords).toBe(1);
      expect(summary.totalDifference).toBe(-550);
      expect(summary.errorsByType).toHaveProperty("Value difference");
    });
  });
});
