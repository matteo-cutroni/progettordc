const expect = require("chai").expect;
const fetch = require("node-fetch");

describe("GET /api/datori", () => {
    it("Send GET request to http://localhost:8080/api/datori", async() => {
        await fetch("http://localhost:8080/api/datori")
            .then((result) => {
                expect(result.status).to.equal(200);
            });
    });
});

describe("GET /api/lavoratori", () => {
    it("Send GET request to http://localhost:8080/api/lavoratori", async() => {
        await fetch("http://localhost:8080/api/lavoratori")
            .then((result) => {
                expect(result.status).to.equal(200);
            })
    });
});

describe("GET /api/jobs", () => {
    it("Send GET request to http://localhost:8080/api/jobs", async() => {
        await fetch("http://localhost:8080/api/jobs")
            .then((result) => {
                expect(result.status).to.equal(200);
            })
    });
});

describe("GET /api/job/:datore", () => {

    it("Send Bad GET request to http://localhost:8080/api/job/:datore", async() => {
        await fetch("http://localhost:8080/api/job/fakeGoogleId")
            .then((result) => {
                expect(result.status).to.equal(404);
            })
    });

    it("Send Good GET request to http://localhost:8080/api/job/:datore", async() => {
        await fetch("http://localhost:8080/api/job/106380052854846251274")
            .then((result) => {
                expect(result.status).to.equal(200);
            })
    });
});