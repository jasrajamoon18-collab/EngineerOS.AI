import type { TestCase } from "@/lib/code-runner";

export interface LessonChallenge {
  lessonId: string;
  language: string;
  tryItCode: string;
  solvePrompt: string;
  solveStarterCode: string;
  testCases: TestCase[];
}

export function getLessonChallenge(
  lessonId: string,
  courseSlug: string,
  lessonTitle: string,
): LessonChallenge {
  const isPython = courseSlug.includes("python");
  const isJava = courseSlug.includes("java");
  const isC =
    courseSlug.includes("c-systems") ||
    courseSlug.includes("c-programming") ||
    courseSlug.includes("-c-");
  const isLinux = courseSlug.includes("linux");

  let language = "python";
  if (isJava) language = "java";
  else if (isC) language = "c";
  else if (isLinux) language = "bash";

  if (isPython) {
    return {
      lessonId,
      language: "python",
      tryItCode: `# Try It: Interactive Python Sandbox for "${lessonTitle}"
def demonstrate_concept():
    data = [10, 25, 45, 80, 100]
    # Experiment with list comprehension and filtering
    filtered = [x * 2 for x in data if x > 30]
    print("Transformed elements:", filtered)
    print("Max item:", max(data))

demonstrate_concept()
`,
      solvePrompt:
        "Implement a function `process_metrics(values)` that takes space-separated integers from STDIN, squares each even number, and outputs their sum.",
      solveStarterCode: `import sys

def process_metrics(values: list[int]) -> int:
    # Your solution: sum of squares of all even numbers
    return sum(x ** 2 for x in values if x % 2 == 0)

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        values = list(map(int, line.split()))
        print(process_metrics(values))
`,
      testCases: [
        {
          id: "tc-py-1",
          input: "1 2 3 4 5",
          expectedOutput: "20",
          description: "2^2 + 4^2 = 4 + 16 = 20",
        },
        { id: "tc-py-2", input: "2 4 6", expectedOutput: "56", description: "All even numbers" },
        {
          id: "tc-py-hidden-1",
          input: "1 3 5 7",
          expectedOutput: "0",
          isHidden: true,
          description: "All odd numbers",
        },
        { id: "tc-py-hidden-2", input: "10 20", expectedOutput: "500", isHidden: true },
      ],
    };
  }

  if (isJava) {
    return {
      lessonId,
      language: "java",
      tryItCode: `// Try It: Java Object-Oriented Sandbox for "${lessonTitle}"
public class Main {
    static class Engine {
        private String name;
        private int horsepower;

        public Engine(String name, int horsepower) {
            this.name = name;
            this.horsepower = horsepower;
        }

        public void printSpecs() {
            System.out.println("Engine: " + name + " | " + horsepower + " HP");
        }
    }

    public static void main(String[] args) {
        Engine v8 = new Engine("Twin-Turbo V8", 650);
        v8.printSpecs();
    }
}
`,
      solvePrompt:
        "Write a program that reads space-separated integers from STDIN and prints the maximum value.",
      solveStarterCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String[] parts = sc.nextLine().trim().split("\\\\s+");
            int max = Integer.MIN_VALUE;
            for (String p : parts) {
                if (!p.isEmpty()) {
                    max = Math.max(max, Integer.parseInt(p));
                }
            }
            System.out.println(max);
        }
    }
}
`,
      testCases: [
        { id: "tc-java-1", input: "3 8 2 15 6", expectedOutput: "15" },
        { id: "tc-java-2", input: "-5 -12 -1 -20", expectedOutput: "-1" },
        { id: "tc-java-hidden-1", input: "100 200 50", expectedOutput: "200", isHidden: true },
      ],
    };
  }

  if (isC) {
    return {
      lessonId,
      language: "c",
      tryItCode: `// Try It: C Systems Memory & Pointer Sandbox for "${lessonTitle}"
#include <stdio.h>
#include <stdlib.h>

void swap_pointers(int **a, int **b) {
    int *temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x = 42, y = 99;
    int *px = &x, *py = &y;
    
    printf("Before swap: *px = %d, *py = %d\\n", *px, *py);
    swap_pointers(&px, &py);
    printf("After swap:  *px = %d, *py = %d\\n", *px, *py);
    return 0;
}
`,
      solvePrompt:
        "Read space-separated integers from STDIN, compute their sum, and print the result.",
      solveStarterCode: `#include <stdio.h>

int main() {
    long long sum = 0;
    long long val;
    while (scanf("%lld", &val) == 1) {
        sum += val;
    }
    printf("%lld\\n", sum);
    return 0;
}
`,
      testCases: [
        { id: "tc-c-1", input: "10 20 30", expectedOutput: "60" },
        { id: "tc-c-2", input: "-5 5 15", expectedOutput: "15" },
        { id: "tc-c-hidden-1", input: "100 200 -50", expectedOutput: "250", isHidden: true },
      ],
    };
  }

  // Default / Web / Scripting fallback
  return {
    lessonId,
    language: "python",
    tryItCode: `# Try It: Interactive Engineering Sandbox
def run_diagnostic():
    system_status = {"cpu": "nominal", "memory": "optimal", "ready": True}
    print("Diagnostic result:", system_status)

run_diagnostic()
`,
    solvePrompt:
      "Read space-separated numbers and print the total count of numbers greater than 10.",
    solveStarterCode: `import sys

def count_greater_than_ten(nums: list[int]) -> int:
    return sum(1 for x in nums if x > 10)

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        nums = list(map(int, line.split()))
        print(count_greater_than_ten(nums))
`,
    testCases: [
      { id: "tc-gen-1", input: "5 12 18 3 25", expectedOutput: "3" },
      { id: "tc-gen-2", input: "1 2 3", expectedOutput: "0" },
      { id: "tc-gen-hidden-1", input: "11 12 13 14", expectedOutput: "4", isHidden: true },
    ],
  };
}
