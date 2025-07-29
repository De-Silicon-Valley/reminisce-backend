import rateLimiter from "express-rate-limit"

export const signInAndSignUpLimiter = rateLimiter({
    max: 5,
    windowMs: 10000, // 10 seconds
    message: {
        msg: "Too many requests. Try again later"
    }
})

export const studentRecordAndReportLimiter = rateLimiter({
    max: 10,
    windowMs: 100000, // 10 minutes
    message: {
        msg: "Too many form submission requests. Try again later"
    }
})