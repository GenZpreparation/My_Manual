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
├── sql/          javascript/          dsa/          system-design/
```

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
