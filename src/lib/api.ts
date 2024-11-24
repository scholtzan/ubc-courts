import { type TennisCourt, CourtAvailability, type RequestTokens } from '$lib/types';

const BASE_URL = "https://ubc.perfectmind.com"
const PUBLIC_RENTAL_ID = "f95d0698-b707-4c1b-b854-9ffaf1844cdc"

export const getCourts = async (): Promise<TennisCourt[]> => {
    const url = BASE_URL + "/24063/Clients/BookMe4FacilityList/GetFacilities"
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                "take": 20,
                "StartDate": "20241123",
                "ShouldCheckAvailability": "false",
            }),
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data = await response.json();
        const courts: TennisCourt[] = await Promise.all(data.facilities.map(async (court: any) => ({
            id: court.ID,
            name: court.Name,
            imageUrl: court.Image,
            availabilities: await getCourtAvailabilities(court.ID, (new Date()).toISOString(), 7)
        })));

        console.log(courts);

        return courts;
    } catch (error) {
        console.error('API call failed:', error);
        return [];
    }
}

export const getCourtAvailabilities = async (courtId: string, date: string, days: number): Promise<Map<string, boolean>> => {
    try {
        const url = BASE_URL + `/24063/Clients/BookMe4LandingPages/Facility?facilityId=${courtId}`
        const request = await fetch(url, {
            method: 'GET',
            credentials: 'include'
        });

        if (!request.ok) {
            throw new Error(`Error fetching data: ${request.statusText}`);
        }

        const pageData = await request.body;

        const durationRegex = /(?:"DurationIDs":\[)([^\]]*)/;
        const pageContent = await streamToString(pageData);
        const durationMatch = durationRegex.exec(pageContent);
        const rawDurationIds = durationMatch[0].replace('"DurationIDs":[', "").split(",");
        const durationIds = rawDurationIds.map((durationId) => (durationId.replaceAll('"', "")));
        const durationIdParam = durationIds.join("&durationIds%5B%5D=");

        const tokenRegex = /<input name="__RequestVerificationToken" type="hidden" value="([^"]+)/;
        const tokenMatch = tokenRegex.exec(pageContent);

        const requestVerificationToken = tokenMatch[0].replace('<input name="__RequestVerificationToken" type="hidden" value="', '');


        const cookies = request.headers.getSetCookie();
        var cookieRequestToken = undefined;


        for (var cookie of cookies) {
            if (cookie.includes("__RequestVerificationToken=")) {
                for (var cookieValue of cookie.split(";")) {
                    if (cookieValue.startsWith("__RequestVerificationToken=")) {
                        cookieRequestToken = cookieValue.replace("__RequestVerificationToken=", "");
                        break;
                    }
                }
            }
        }

        const requestTokens: RequestTokens = {
            cookieVerificationToken: cookieRequestToken,
            requestVerificationToken: requestVerificationToken
        };

        const availabilityUrl = BASE_URL + "/24063/Clients/BookMe4LandingPages/FacilityAvailability"

        const response = await fetch(availabilityUrl, {
            "credentials": "include",
            "headers": {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:132.0) Gecko/20100101 Firefox/132.0",
                "Accept": "application/json, text/javascript, */*; q=0.01",
                "Accept-Language": "en-CA,en-US;q=0.7,en;q=0.3",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin",
                "Cookie": `__RequestVerificationToken=${requestTokens.cookieVerificationToken}`
            },
            "body": `facilityId=${courtId}&date=${date}&daysCount=7&duration=60&serviceId=${PUBLIC_RENTAL_ID}&durationIds%5B%5D=${durationIdParam}&__RequestVerificationToken=${requestTokens.requestVerificationToken}`,
            "method": "POST",
            "mode": "cors"
        });

        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data = await response.json();
        // console.log(data);
        var availabilities = new Map<string, boolean>();

        for (var availabilityDay of data.availabilities) {
            const date = new Date(0);
            date.setUTCMilliseconds(availabilityDay.Date.replace("/Date(", "").replace(")/", ""))

            for (var bookingGroup of availabilityDay.BookingGroups) {
                for (var availableSpot of bookingGroup.AvailableSpots) {
                    date.setHours(availableSpot.Time.Hours);
                    availabilities.set(date.toJSON(), !availableSpot.IsDisabled);
                }
            }
        }

        return availabilities;
    } catch (error) {
        console.error('API call failed:', error);
        return new Map<string, boolean>();
    }
}

export const getRequestTokens = async (): Promise<RequestTokens> => {
    const url = BASE_URL + '/24063/Clients/BookMe4FacilityList/List'
    const request = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });

    if (!request.ok) {
        throw new Error(`Error fetching data: ${request.statusText}`);
    }

    const cookies = request.headers.getSetCookie();
    var cookieRequestToken = undefined;

    for (var cookie of cookies) {
        if (cookie.includes("__RequestVerificationToken=")) {
            for (var cookieValue of cookie.split(";")) {
                if (cookieValue.startsWith("__RequestVerificationToken=")) {
                    cookieRequestToken = cookieValue.replace("__RequestVerificationToken=", "");
                    break;
                }
            }
        }
    }

    const data = await request.body;

    const tokenRegex = /<input name="__RequestVerificationToken" type="hidden" value="([^"]+)/;
    const pageContent = await streamToString(data);
    const tokenMatch = tokenRegex.exec(pageContent);

    const requestVerificationToken = tokenMatch[0].replace('<input name="__RequestVerificationToken" type="hidden" value="', '');

    const tokens: RequestTokens = {
        cookieVerificationToken: cookieRequestToken,
        requestVerificationToken: requestVerificationToken
    };

    return tokens;
}

async function streamToString(stream: any) {
    const reader = stream.getReader();
    const textDecoder = new TextDecoder();
    let result = '';
  
    async function read() {
      const { done, value } = await reader.read();
  
      if (done) {
        return result;
      }
  
      result += textDecoder.decode(value, { stream: true });
      return read();
    }
  
    return read();
  }