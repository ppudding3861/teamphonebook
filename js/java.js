// 이 js는 주변검색 js이다. 잘 기억해줘

// 버튼을 클릭하여 추가 버튼을 보여주거나 숨기는 함수
const toggleButtons = () => {
    document.querySelector('.top-buttons').classList.toggle('show-buttons');
};

// 마커를 클릭하면 장소명을 표출할 인포윈도우입니다
const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

const mapContainer = document.getElementById('map');
const mapOption = {
    center: new kakao.maps.LatLng(37.566826, 126.9786567),
    level: 3
};

// 지도를 생성합니다    
const map = new kakao.maps.Map(mapContainer, mapOption);

// 장소 검색 객체를 생성합니다
const ps = new kakao.maps.services.Places();

// 모든 마커를 저장할 배열
let markers = [];

// 사용자 위치 마커
let userMarker;

// 사용자 위치 마커 이미지 설정
const userMarkerImage = new kakao.maps.MarkerImage(
    'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
    new kakao.maps.Size(50, 50),
    {
        offset: new kakao.maps.Point(25, 50)
    }
);

// 사용자의 현위치로 마커 추가
const locateUser = () => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude: lat, longitude: lon } = position.coords;
                const userLocation = new kakao.maps.LatLng(lat, lon);

                if (userMarker) {
                    userMarker.setMap(null);
                }

                userMarker = new kakao.maps.Marker({
                    position: userLocation,
                    map,
                    image: userMarkerImage,
                    title: '현위치'
                });

                map.setCenter(userLocation);
                map.setLevel(3);
                resolve(userLocation);
            }, () => {
                alert('위치 정보를 가져올 수 없습니다.');
                reject(new Error('위치 정보를 가져올 수 없습니다.'));
            });
        } else {
            alert('이 브라우저는 위치 정보를 지원하지 않습니다.');
            reject(new Error('이 브라우저는 위치 정보를 지원하지 않습니다.'));
        }
    });
};

// 장소 검색 및 지도에 표시
const searchPlaces = (location, keyword) => {
    const places = new kakao.maps.services.Places();

    const callback = (data, status) => {
        if (status === kakao.maps.services.Status.OK) {
            const bounds = new kakao.maps.LatLngBounds();

            data.forEach(place => {
                displayMarker(place);
                bounds.extend(new kakao.maps.LatLng(place.y, place.x));
            });

            map.setBounds(bounds);
        } else {
            alert(`${keyword} 정보를 가져올 수 없습니다.`);
        }
    };

    places.keywordSearch(keyword, callback, {
        location,
        radius: 3000
    });
};

// 지도에 마커를 표시하는 함수입니다
const displayMarker = place => {
    const marker = new kakao.maps.Marker({
        map,
        position: new kakao.maps.LatLng(place.y, place.x)
    });

    markers.push(marker);

    const content = `
        <div style="padding:10px; font-size:12px; border:1px solid #ccc; background-color:#fff;">
            <strong>${place.place_name}</strong><br>
            주소: ${place.road_address_name || place.address_name}<br>
            전화번호: ${place.phone || '없음'}
        </div>
    `;

    kakao.maps.event.addListener(marker, 'click', () => {
        if (infowindow.getMap()) {
            infowindow.close();
        } else {
            infowindow.setContent(content);
            infowindow.open(map, marker);
        }
    });
};

// 모든 마커를 제거하는 함수입니다
const clearMarkers = () => {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
};

// 병원 버튼 클릭 시 병원 정보 검색
document.getElementById('hospitalButton').addEventListener('click', async () => {
    try {
        const userLocation = await locateUser();
        searchPlaces(userLocation, '병원');
    } catch (error) {
        console.error(error);
    }
});

// 맛집 버튼 클릭 시 맛집 정보 검색
document.getElementById('foodButton').addEventListener('click', async () => {
    try {
        const userLocation = await locateUser();
        searchPlaces(userLocation, '맛집');
    } catch (error) {
        console.error(error);
    }
});

// 편의점 버튼 클릭 시 편의점 정보 검색
document.getElementById('storeButton').addEventListener('click', async () => {
    try {
        const userLocation = await locateUser();
        searchPlaces(userLocation, '편의점');
    } catch (error) {
        console.error(error);
    }
});

// 주차장 버튼 클릭 시 주차장 정보 검색
document.getElementById('parkingButton').addEventListener('click', async () => {
    try {
        const userLocation = await locateUser();
        searchPlaces(userLocation, '주차장');
    } catch (error) {
        console.error(error);
    }
});

// 검색창에서 검색어 입력 후 Enter 키를 누르면 검색
document.querySelector('.search-bar').addEventListener('keypress', async event => {
    if (event.key === 'Enter') {
        try {
            const userLocation = await locateUser();
            const keyword = event.target.value;
            clearMarkers();
            searchPlaces(userLocation, keyword);
        } catch (error) {
            console.error(error);
        }
    }
});

// 모든 버튼에 클릭 효과 추가
document.querySelectorAll('.icon-circle').forEach(button => {
    button.addEventListener('click', function() {
        this.classList.add('clicked');
        setTimeout(() => this.classList.remove('clicked'), 200);
    });
});

// 페이지 로드 시 사용자의 현위치를 표시합니다.
window.onload = async () => {
    try {
        await locateUser();
    } catch (error) {
        console.error(error);
    }
};

// Undo 버튼 클릭 시 모든 마커를 제거하고 현위치만 표시, 검색창 초기화
document.getElementById('undoButton').addEventListener('click', async () => {
    try {
        clearMarkers();
        await locateUser();
        document.querySelector('.search-bar').value = '';
    } catch (error) {
        console.error(error);
    }
});
