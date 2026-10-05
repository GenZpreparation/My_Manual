# data/ folder -- saare interview questions yahin hai

Har programming language ka **apna folder** hai. Folder ka naam hi URL banta hai
(`data/python` -> `/tracks/python`).

```
data/
├── README.md              <- ye file
├── _template/             <- naya language add karne ke liye COPY karo (site isse ignore karti hai)
│   ├── track.json
│   └── module_0.json
├── python/                <- LIVE (module files hai)
│   ├── track.json         <- name, icon, order, chhota description
│   ├── module_0.json      <- Module 0 ke questions
│   ├── module_1.json
│   └── ...
├── java/                  <- abhi sirf track.json -> site pe "Coming soon" dikhta hai
│   └── track.json
├── dsa/                    <- LIVE, par apna page hai: /dsa
│   ├── track.json          <- sirf navbar/home card ke liye (route: "/dsa")
│   └── problems.json       <- 718 DSA problems (questions + practice links)
├── sql/          javascript/          system-design/
```

## DSA sheet alag kyun hai (`/dsa`)

`data/dsa/` me track ka normal format nahi hai. Wahan **question + model answer**
nahi, **problem + practice link** hote hai (LeetCode / GFG), aur progress user
ke browser me localStorage me save hota hai. Isliye:

- Data padhne ke liye: `lib/dsa.js` (server-only, `fs` use karta hai)
- Page: `app/dsa/page.js` -> `/dsa`
- Client components: `components/dsa/` (constants `lib/dsaShared.js` se)

`track.json` me `"route": "/dsa"` likhne se wo track "Coming soon" nahi dikhta
aur navbar/home/footer ka link seedha `/dsa` par jaata hai.

### `problems.json` me ek problem ka format

```json
{
  "id": "a_0001",
  "part": "A",
  "source": "DSA Master Sheet",
  "difficulty": "easy",
  "topic": "Basic Maths",
  "subtopic": null,
  "master_serial": 42,
  "stars": 1,
  "title": "Check if a number is Armstrong",
  "links": { "leetcode": null, "gfg": "https://..." }
}
```

`filters.topic_order_part_a` se sidebar me topics ka order tay hota hai. Problem
add karna ho to bas `problems` array me ek entry daal do -- baaki (counts,
difficulty totals, search index, sitemap) apne aap update ho jaata hai.

## Naya language kaise add kare (2 minute)

1. `data/_template` folder ko copy karke naam do, jaise `data/cpp` (chhota, lowercase, space nahi -- `-` chalega).
2. `track.json` badlo:
   ```json
   { "index": "07", "name": "C++", "icon": "🔧", "meta": "pointers to templates" }
   ```
   `index` se tracks ka order tay hota hai (01, 02, 03 ...).
3. `module_0.json` me apne questions daalo (neeche format hai). Aur modules chahiye to
   `module_1.json`, `module_2.json` ... banate jao.
4. Bas! Code me kuch nahi badalna. Tracks list, navbar dropdown, footer, track page
   aur search sab **apne aap** update ho jaate hai. Dev me (`npm run dev`) file save karte hi, bina restart ke, browser refresh par dikh jaata hai.
   Production me deploy/`npm run build` ke baad live hota hai (JSON site ke saath bundle hoti hai).

Jab tak folder me koi `module_N.json` nahi hai, wo track "Coming soon" rehta hai.

## Rules

- File ka naam `module_<number>.json` hi hona chahiye. Number se order tay hota hai
  (`module_2` `module_10` se pehle aayega).
- `_` se shuru hone wale folders (jaise `_template`) ignore hote hai.
- Ek track ke andar `id` (file ka naam) unique hota hai; question `id` sirf us module ke andar unique ho.

## module_N.json ka format

```json
{
  "meta": { "module": "Module 0", "title": "...", "description": "...", "level": "Beginner" },
  "categories": [ { "id": "basics", "name": "Basics" } ],
  "questions": [
    {
      "id": 1,
      "category": "basics",
      "question": "What is ...?",
      "answer": {
        "short_answer": "...",
        "detailed_explanation": "...",
        "code_examples": [ { "title": "...", "code": "...", "output": "...", "explanation": "..." } ]
      }
    }
  ]
}
```

`answer` me ye optional keys bhi chalti hai: `explanation`, `how_it_works`, `important_points`,
`common_mistakes`, `real_world_usage`, `interview_tip`.
