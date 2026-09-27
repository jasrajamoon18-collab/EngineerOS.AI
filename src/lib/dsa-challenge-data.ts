import type { TestCase } from "@/lib/code-runner";

export interface DsaChallengeDetail {
  problemId: string;
  constraints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  testCases: TestCase[];
  starterCode: {
    python: string;
    cpp: string;
    java: string;
    c: string;
    javascript: string;
  };
}

export const DSA_CHALLENGE_REGISTRY: Record<string, DsaChallengeDetail> = {
  "dsa-two-sum": {
    problemId: "dsa-two-sum",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
    ],
    testCases: [
      {
        id: "tc-two-sum-1",
        input: "2 7 11 15\n9",
        expectedOutput: "0 1",
        description: "Standard sample test case",
      },
      {
        id: "tc-two-sum-2",
        input: "3 2 4\n6",
        expectedOutput: "1 2",
        description: "Non-adjacent elements",
      },
      {
        id: "tc-two-sum-3",
        input: "3 3\n6",
        expectedOutput: "0 1",
        description: "Duplicate elements",
      },
      {
        id: "tc-two-sum-hidden-1",
        input: "-1 -2 -3 -4 -5\n-8",
        expectedOutput: "2 4",
        isHidden: true,
        description: "Negative numbers boundary case",
      },
      {
        id: "tc-two-sum-hidden-2",
        input: "0 4 3 0\n0",
        expectedOutput: "0 3",
        isHidden: true,
        description: "Zero target with zeroes in array",
      },
    ],
    starterCode: {
      python: `import sys

def two_sum(nums: list[int], target: int) -> list[int]:
    lookup = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in lookup:
            return [lookup[complement], i]
        lookup[num] = i
    return []

if __name__ == "__main__":
    lines = sys.stdin.read().strip().split("\\n")
    if len(lines) >= 2:
        nums = list(map(int, lines[0].split()))
        target = int(lines[1])
        ans = two_sum(nums, target)
        print(" ".join(map(str, ans)))
`,
      cpp: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <sstream>

using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> mp;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (mp.count(complement)) {
            return {mp[complement], i};
        }
        mp[nums[i]] = i;
    }
    return {};
}

int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        vector<int> nums;
        int val;
        while (ss >> val) nums.push_back(val);
        int target;
        if (cin >> target) {
            vector<int> ans = twoSum(nums, target);
            if (!ans.empty()) {
                cout << ans[0] << " " << ans[1] << endl;
            }
        }
    }
    return 0;
}
`,
      java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String[] parts = sc.nextLine().trim().split("\\\\s+");
            int[] nums = new int[parts.length];
            for (int i = 0; i < parts.length; i++) {
                nums[i] = Integer.parseInt(parts[i]);
            }
            if (sc.hasNextInt()) {
                int target = sc.nextInt();
                int[] ans = twoSum(nums, target);
                if (ans.length == 2) {
                    System.out.println(ans[0] + " " + ans[1]);
                }
            }
        }
    }
}
`,
      c: `#include <stdio.h>
#include <stdlib.h>

void solve() {
    int nums[10000];
    int n = 0;
    while (scanf("%d", &nums[n]) == 1) {
        n++;
        char c = getchar();
        if (c == '\\n' || c == EOF) break;
    }
    int target;
    if (scanf("%d", &target) == 1) {
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (nums[i] + nums[j] == target) {
                    printf("%d %d\\n", i, j);
                    return;
                }
            }
        }
    }
}

int main() {
    solve();
    return 0;
}
`,
      javascript: `const fs = require('fs');

function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (input.length >= 2) {
  const nums = input[0].trim().split(/\\s+/).map(Number);
  const target = Number(input[1]);
  const ans = twoSum(nums, target);
  console.log(ans.join(' '));
}
`,
    },
  },

  "dsa-valid-parentheses": {
    problemId: "dsa-valid-parentheses",
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only: '()[]{}'."],
    examples: [
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    testCases: [
      { id: "tc-vp-1", input: "()[]{}", expectedOutput: "true" },
      { id: "tc-vp-2", input: "(]", expectedOutput: "false" },
      { id: "tc-vp-3", input: "([{}])", expectedOutput: "true" },
      { id: "tc-vp-hidden-1", input: "[", expectedOutput: "false", isHidden: true },
      { id: "tc-vp-hidden-2", input: "{[]}", expectedOutput: "true", isHidden: true },
    ],
    starterCode: {
      python: `import sys

def is_valid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    print("true" if is_valid(line) else "false")
`,
      cpp: `#include <iostream>
#include <stack>
#include <string>

using namespace std;

bool isValid(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') {
            st.push(c);
        } else {
            if (st.empty()) return false;
            char top = st.top();
            st.pop();
            if (c == ')' && top != '(') return false;
            if (c == '}' && top != '{') return false;
            if (c == ']' && top != '[') return false;
        }
    }
    return st.empty();
}

int main() {
    string s;
    if (cin >> s) {
        cout << (isValid(s) ? "true" : "false") << endl;
    }
    return 0;
}
`,
      java: `import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s = sc.next().trim();
            System.out.println(isValid(s) ? "true" : "false");
        }
    }
}
`,
      c: `#include <stdio.h>
#include <stdbool.h>
#include <string.h>

bool isValid(char *s) {
    char stack[10000];
    int top = -1;
    int len = strlen(s);
    for (int i = 0; i < len; i++) {
        char c = s[i];
        if (c == '(' || c == '{' || c == '[') {
            stack[++top] = c;
        } else {
            if (top < 0) return false;
            char prev = stack[top--];
            if (c == ')' && prev != '(') return false;
            if (c == '}' && prev != '{') return false;
            if (c == ']' && prev != '[') return false;
        }
    }
    return top == -1;
}

int main() {
    char s[10005];
    if (scanf("%s", s) == 1) {
        printf("%s\\n", isValid(s) ? "true" : "false");
    }
    return 0;
}
`,
      javascript: `const fs = require('fs');

function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const c of s) {
    if (c === '(' || c === '{' || c === '[') {
      stack.push(c);
    } else {
      if (!stack.length || stack.pop() !== map[c]) return false;
    }
  }
  return stack.length === 0;
}

const input = fs.readFileSync(0, 'utf-8').trim();
console.log(isValid(input) ? "true" : "false");
`,
    },
  },

  "dsa-binary-search": {
    problemId: "dsa-binary-search",
    constraints: [
      "1 <= nums.length <= 10^4",
      "-10^4 < nums[i], target < 10^4",
      "All the integers in nums are unique.",
      "nums is sorted in ascending order.",
    ],
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4" },
      { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1" },
    ],
    testCases: [
      { id: "tc-bs-1", input: "-1 0 3 5 9 12\n9", expectedOutput: "4" },
      { id: "tc-bs-2", input: "-1 0 3 5 9 12\n2", expectedOutput: "-1" },
      { id: "tc-bs-3", input: "5\n5", expectedOutput: "0" },
      {
        id: "tc-bs-hidden-1",
        input: "1 2 3 4 5 6 7 8 9 10\n1",
        expectedOutput: "0",
        isHidden: true,
      },
      {
        id: "tc-bs-hidden-2",
        input: "1 2 3 4 5 6 7 8 9 10\n10",
        expectedOutput: "9",
        isHidden: true,
      },
    ],
    starterCode: {
      python: `import sys

def search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

if __name__ == "__main__":
    lines = sys.stdin.read().strip().split("\\n")
    if len(lines) >= 2:
        nums = list(map(int, lines[0].split()))
        target = int(lines[1])
        print(search(nums, target))
`,
      cpp: `#include <iostream>
#include <vector>
#include <sstream>

using namespace std;

int search(vector<int>& nums, int target) {
    int left = 0, right = nums.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        vector<int> nums;
        int x;
        while (ss >> x) nums.push_back(x);
        int target;
        if (cin >> target) {
            cout << search(nums, target) << endl;
        }
    }
    return 0;
}
`,
      java: `import java.util.*;

public class Main {
    public static int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String[] parts = sc.nextLine().trim().split("\\\\s+");
            int[] nums = new int[parts.length];
            for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
            if (sc.hasNextInt()) {
                int target = sc.nextInt();
                System.out.println(search(nums, target));
            }
        }
    }
}
`,
      c: `#include <stdio.h>

int search(int* nums, int numsSize, int target) {
    int left = 0, right = numsSize - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    int nums[10000];
    int n = 0;
    while (scanf("%d", &nums[n]) == 1) {
        n++;
        char c = getchar();
        if (c == '\\n' || c == EOF) break;
    }
    int target;
    if (scanf("%d", &target) == 1) {
        printf("%d\\n", search(nums, n, target));
    }
    return 0;
}
`,
      javascript: `const fs = require('fs');

function search(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
  const nums = lines[0].trim().split(/\\s+/).map(Number);
  const target = Number(lines[1]);
  console.log(search(nums, target));
}
`,
    },
  },

  "dsa-reverse-linked-list": {
    problemId: "dsa-reverse-linked-list",
    constraints: [
      "The number of nodes in the list is the range [0, 5000].",
      "-5000 <= Node.val <= 5000",
    ],
    examples: [
      { input: "1 2 3 4 5", output: "5 4 3 2 1" },
      { input: "1 2", output: "2 1" },
    ],
    testCases: [
      { id: "tc-rev-1", input: "1 2 3 4 5", expectedOutput: "5 4 3 2 1" },
      { id: "tc-rev-2", input: "1 2", expectedOutput: "2 1" },
      { id: "tc-rev-3", input: "42", expectedOutput: "42" },
      {
        id: "tc-rev-hidden-1",
        input: "10 20 30 40 50 60 70",
        expectedOutput: "70 60 50 40 30 20 10",
        isHidden: true,
      },
    ],
    starterCode: {
      python: `import sys

def reverse_list(values: list[int]) -> list[int]:
    # Simulate reverse of linked list
    return values[::-1]

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        values = list(map(int, line.split()))
        print(" ".join(map(str, reverse_list(values))))
`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
#include <sstream>

using namespace std;

int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        vector<int> nums;
        int x;
        while (ss >> x) nums.push_back(x);
        reverse(nums.begin(), nums.end());
        for (int i = 0; i < nums.size(); i++) {
            cout << nums[i] << (i + 1 < nums.size() ? " " : "");
        }
        cout << endl;
    }
    return 0;
}
`,
      java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String[] parts = sc.nextLine().trim().split("\\\\s+");
            List<String> list = Arrays.asList(parts);
            Collections.reverse(list);
            System.out.println(String.join(" ", list));
        }
    }
}
`,
      c: `#include <stdio.h>

int main() {
    int nums[5000];
    int n = 0;
    while (scanf("%d", &nums[n]) == 1) {
        n++;
    }
    for (int i = n - 1; i >= 0; i--) {
        printf("%d%s", nums[i], i > 0 ? " " : "\\n");
    }
    return 0;
}
`,
      javascript: `const fs = require('fs');
const line = fs.readFileSync(0, 'utf-8').trim();
if (line) {
  const parts = line.split(/\\s+/);
  console.log(parts.reverse().join(' '));
}
`,
    },
  },
};

/**
 * Fallback generator for problems not explicitly mapped above
 */
export function getDsaChallengeDetail(problemId: string, title: string): DsaChallengeDetail {
  if (DSA_CHALLENGE_REGISTRY[problemId]) {
    return DSA_CHALLENGE_REGISTRY[problemId];
  }

  // Generic fallback with realistic test cases
  return {
    problemId,
    constraints: [
      "Optimal Time Complexity: O(N) or O(N log N)",
      "Space Complexity: O(1) or O(N)",
      "Standard input format: Space-separated inputs via STDIN",
    ],
    examples: [
      { input: "1 2 3", output: "6", explanation: "Sample input and expected output" },
      { input: "4 5 6", output: "15" },
    ],
    testCases: [
      {
        id: `tc-${problemId}-1`,
        input: "1 2 3",
        expectedOutput: "6",
        description: "Sample case 1",
      },
      {
        id: `tc-${problemId}-2`,
        input: "4 5 6",
        expectedOutput: "15",
        description: "Sample case 2",
      },
      { id: `tc-${problemId}-hidden-1`, input: "10 20 30", expectedOutput: "60", isHidden: true },
    ],
    starterCode: {
      python: `# Solution for: ${title}
import sys

def solve(data: list[int]) -> int:
    # Your algorithmic solution here
    return sum(data)

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    if line:
        data = list(map(int, line.split()))
        print(solve(data))
`,
      cpp: `// Solution for: ${title}
#include <iostream>
#include <vector>
#include <numeric>
#include <sstream>

using namespace std;

int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        vector<int> nums;
        int x;
        while (ss >> x) nums.push_back(x);
        
        long long total = 0;
        for (int v : nums) total += v;
        cout << total << endl;
    }
    return 0;
}
`,
      java: `// Solution for: ${title}
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String[] parts = sc.nextLine().trim().split("\\\\s+");
            long sum = 0;
            for (String p : parts) {
                if (!p.isEmpty()) sum += Long.parseLong(p);
            }
            System.out.println(sum);
        }
    }
}
`,
      c: `// Solution for: ${title}
#include <stdio.h>

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
      javascript: `// Solution for: ${title}
const fs = require('fs');
const line = fs.readFileSync(0, 'utf-8').trim();
if (line) {
  const nums = line.split(/\\s+/).map(Number);
  const sum = nums.reduce((a, b) => a + b, 0);
  console.log(sum);
}
`,
    },
  };
}
