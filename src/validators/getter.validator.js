import { body, validationResult } from "express-validator";



function validationResultReq (req, res, next)  {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  next();
};

export const profileValidator = [


  body("bio")
    .notEmpty()
    .withMessage("Bio is required")
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),

  body("experience")
    .notEmpty()
    .withMessage("Experience is required")
    .isNumeric()
    .withMessage("Experience must be a number"),

  body("city")
    .notEmpty()
    .withMessage("City is required"),
body("profession")
    .custom((value) => {
        let parsed;
        try {
            parsed = typeof value === "string" ? JSON.parse(value) : value;
        } catch {
            throw new Error("Profession must be a valid array");
        }
        if (!Array.isArray(parsed) || parsed.length === 0) {
            throw new Error("At least one profession is required");
        }
        const allowed = ["photographer", "videographer", "editor"];
        if (!parsed.every((p) => allowed.includes(p))) {
            throw new Error("Invalid profession value");
        }
        return true;
    }),

body("equipments")
    .custom((value) => {
        let parsed;
        try {
            parsed = typeof value === "string" ? JSON.parse(value) : value;
        } catch {
            throw new Error("Equipments must be a valid array");
        }
        if (!Array.isArray(parsed) || parsed.length === 0) {
            throw new Error("At least one equipment is required");
        }
        return true;
    }),

  validationResultReq
];