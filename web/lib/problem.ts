import z from "zod";

export const ProblemScheme = z.object({
    status: z.string(),
});

export type Problem = z.infer<typeof ProblemScheme>;

export function createProblem(problem: Problem, httpStatus: number = 400): Response {
    return new Response(JSON.stringify(problem), {
        status: httpStatus,
        headers: { "Content-Type": "application/json" }
    });
}
