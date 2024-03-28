interface SVGObject {
    [key: string]: {
        d: string[],
        fill?: string,
        viewBox?: string,
    }
}
export const SVG: SVGObject = {
    backspace: {
        d: ["M360-200q-20 0-37.5-9T294-234L120-480l174-246q11-16 28.5-25t37.5-9h400q33 0 56.5 23.5T840-680v400q0 33-23.5 56.5T760-200H360Zm400-80v-400 400Zm-400 0h400v-400H360L218-480l142 200Zm96-40 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Z"],
    },
    create_folder: {
        d: ["M574-318h54v-82h82v-54h-82v-82h-54v82h-82v54h82v82ZM186-180q-36.725 0-61.363-24.637Q100-229.275 100-266v-428q0-36.725 24.637-61.362Q149.275-780 186-780h167l106 106h315q36.725 0 61.362 24.638Q860-624.725 860-588v322q0 36.725-24.638 61.363Q810.725-180 774-180H186Zm0-54h588q14 0 23-9t9-23v-322q0-14-9-23t-23-9H437L331-726H186q-14 0-23 9t-9 23v428q0 14 9 23t23 9Zm-32 0v-492 492Z"],
    },
    cancel: {
        d: ["m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"],
    },
    circle_play: {
        d: ["M10.5 9.79999C10.5 9.35818 10.8582 9 11.3 9H11.7C12.1418 9 12.5 9.35818 12.5 9.79999V18.2C12.5 18.6418 12.1418 19 11.7 19H11.3C10.8582 19 10.5 18.6418 10.5 18.2V9.79999Z", "M16.3 9C15.8582 9 15.5 9.35818 15.5 9.79999V18.2C15.5 18.6418 15.8582 19 16.3 19H16.7C17.1418 19 17.5 18.6418 17.5 18.2V9.79999C17.5 9.35818 17.1418 9 16.7 9H16.3Z", "M1 14C1 6.82031 6.82031 1 14 1C21.1797 1 27 6.82031 27 14C27 21.1797 21.1797 27 14 27C6.82031 27 1 21.1797 1 14ZM14 3C7.92487 3 3 7.92487 3 14C3 20.0751 7.92487 25 14 25C20.0751 25 25 20.0751 25 14C25 7.92487 20.0751 3 14 3Z"],
        viewBox: '0 0 28 28',
    },
    circle_pause: {
        d: ["M19.5 13.134C20.1667 13.5189 20.1667 14.4811 19.5 14.866L12 19.1962C11.3333 19.5811 10.5 19.0999 10.5 18.3301V9.66987C10.5 8.90007 11.3333 8.41895 12 8.80385L19.5 13.134ZM12.5 11.4019L17 14L12.5 16.5981V11.4019Z", "M14 1C6.8203 1 1 6.8203 1 14C1 21.1797 6.8203 27 14 27C21.1797 27 27 21.1797 27 14C27 6.8203 21.1797 1 14 1ZM3 14C3 7.92487 7.92487 3 14 3C20.0751 3 25 7.92487 25 14C25 20.0751 20.0751 25 14 25C7.92487 25 3 20.0751 3 14Z"],
        viewBox: '0 0 28 28',
    },
    circle_next: {
        d: ['M507-480 384-357l56 57 180-180-180-180-56 57 123 123ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z']
    },
    circle_stop: {
        d: ['M320-320h320v-320H320v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z']
    },
    delete: {
        d: ["m375-316 106-106 106 106 38-38-106-106 106-106-38-38-106 106-106-106-38 38 106 106-106 106 38 38Zm-67 176q-36.725 0-61.363-24.637Q222-189.275 222-226v-498h-40v-54h176v-36h246v36h176v54h-40v498q0 36.725-24.638 61.363Q690.725-140 654-140H308Zm378-584H276v498q0 12 10 22t22 10h346q12 0 22-10t10-22v-498Zm-410 0v530-530Z"],
    },
    download: {
        d: ["M290-290h380v-54H290v54Zm190-128 144-144-38-38-80 82v-198h-54v196l-78-80-38 38 144 144Zm.174 318q-78.814 0-148.212-29.911-69.399-29.912-120.734-81.188-51.336-51.277-81.282-120.595Q100-401.012 100-479.826q0-79.07 29.97-148.694 29.971-69.623 81.348-121.126 51.378-51.502 120.594-80.928Q401.128-860 479.826-860q79.06 0 148.676 29.391 69.615 29.392 121.13 80.848 51.516 51.457 80.942 121.018Q860-559.181 860-480.091q0 79.091-29.391 148.149-29.392 69.059-80.835 120.496-51.443 51.436-120.987 81.441Q559.244-100 480.174-100ZM480-154q136.513 0 231.256-94.744Q806-343.487 806-480t-94.744-231.256Q616.513-806 480-806t-231.256 94.744Q154-616.513 154-480t94.744 231.256Q343.487-154 480-154Zm0-326Z"],
    },
    expand_more: {
        d: ['M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z'],
    },
    expand_less: {
        d: ['m296-345-56-56 240-240 240 240-56 56-184-184-184 184Z'],
    },
    forward10: {
        d: ['M360-320v-180h-60v-60h120v240h-60Zm140 0q-17 0-28.5-11.5T460-360v-160q0-17 11.5-28.5T500-560h80q17 0 28.5 11.5T620-520v160q0 17-11.5 28.5T580-320h-80Zm20-60h40v-120h-40v120ZM480-80q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-440q0-75 28.5-140.5t77-114q48.5-48.5 114-77T480-800h6l-62-62 56-58 160 160-160 160-56-58 62-62h-6q-117 0-198.5 81.5T200-440q0 117 81.5 198.5T480-160q117 0 198.5-81.5T760-440h80q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-80Z'],
    },
    youtube: {
        d: ["m392-322 246-158-246-158v316ZM192-188q-36.725 0-61.363-24.637Q106-237.275 106-274v-412q0-36.725 24.637-61.362Q155.275-772 192-772h576q36.725 0 61.362 24.638Q854-722.725 854-686v412q0 36.725-24.638 61.363Q804.725-188 768-188H192Zm0-54h576q12 0 22-10t10-22v-412q0-12-10-22t-22-10H192q-12 0-22 10t-10 22v412q0 12 10 22t22 10Zm-32 0v-476 476Z"],
    },
    link: {
        d: ["M428-302H278q-73.87 0-125.935-52.092t-52.065-126Q100-554 152.065-606T278-658h150v54H278q-51 0-87.5 36.5T154-480q0 51 36.5 87.5T278-356h150v54ZM328-454v-54h304v54H328Zm204 152v-54h150q51 0 87.5-36.5T806-480q0-51-36.5-87.5T682-604H532v-54h150q73.87 0 125.935 52.092t52.065 126Q860-406 807.935-354T682-302H532Z"],
    },
    more_vert: {
        d: ["M479.841-186q-17.391 0-29.616-12.384Q438-210.769 438-228.159q0-17.391 12.384-29.616Q462.769-270 480.159-270q17.391 0 29.616 12.384Q522-245.231 522-227.841q0 17.391-12.384 29.616Q497.231-186 479.841-186Zm0-252q-17.391 0-29.616-12.384Q438-462.769 438-480.159q0-17.391 12.384-29.616Q462.769-522 480.159-522q17.391 0 29.616 12.384Q522-497.231 522-479.841q0 17.391-12.384 29.616Q497.231-438 479.841-438Zm0-252q-17.391 0-29.616-12.384Q438-714.769 438-732.159q0-17.391 12.384-29.616Q462.769-774 480.159-774q17.391 0 29.616 12.384Q522-749.231 522-731.841q0 17.391-12.384 29.616Q497.231-690 479.841-690Z"],
    },
    open_folder: {
        d: ["M180-180q-33.725 0-56.863-23.137Q100-226.275 100-260v-434q0-33.725 26.137-59.862Q152.275-780 186-780h167l106 106h315q27.725 0 48.362 15.138Q843-643.725 851-620H437L331-726H186q-14 0-23 9t-9 23v415q0 11 5.5 18t14.5 12l78-271h665l-76 262q-12 44-36.5 61T727-180H180Zm46-54h552l67-232H293l-67 232Zm0 0 67-232-67 232Zm-72-386v-106 106Z"],
    },
    play: {
        d: ["m392-322 246-158-246-158v316Zm88.174 222q-78.814 0-148.212-29.911-69.399-29.912-120.734-81.188-51.336-51.277-81.282-120.595Q100-401.012 100-479.826q0-79.07 29.97-148.694 29.971-69.623 81.348-121.126 51.378-51.502 120.594-80.928Q401.128-860 479.826-860q79.06 0 148.676 29.391 69.615 29.392 121.13 80.848 51.516 51.457 80.942 121.018Q860-559.181 860-480.091q0 79.091-29.391 148.149-29.392 69.059-80.835 120.496-51.443 51.436-120.987 81.441Q559.244-100 480.174-100ZM480-154q136.513 0 231.256-94.744Q806-343.487 806-480t-94.744-231.256Q616.513-806 480-806t-231.256 94.744Q154-616.513 154-480t94.744 231.256Q343.487-154 480-154Zm0-326Z"],
    },
    playlist_add: {
        d: ["M122-322v-54h314v54H122Zm0-178v-54h476v54H122Zm0-180v-54h476v54H122Zm546 522v-164H506v-54h162v-162h54v162h164v54H722v164h-54Z"],
    },
    replay10: {
        d: ['M480-80q-75 0-140.5-28.5t-114-77q-48.5-48.5-77-114T120-440h80q0 117 81.5 198.5T480-160q117 0 198.5-81.5T760-440q0-117-81.5-198.5T480-720h-6l62 62-56 58-160-160 160-160 56 58-62 62h6q75 0 140.5 28.5t114 77q48.5 48.5 77 114T840-440q0 75-28.5 140.5t-77 114q-48.5 48.5-114 77T480-80ZM360-320v-180h-60v-60h120v240h-60Zm140 0q-17 0-28.5-11.5T460-360v-160q0-17 11.5-28.5T500-560h80q17 0 28.5 11.5T620-520v160q0 17-11.5 28.5T580-320h-80Zm20-60h40v-120h-40v120Z'],
    },
    restart: {
        d: ["M440-122q-121-15-200.5-105.5T160-440q0-66 26-126.5T260-672l57 57q-38 34-57.5 79T240-440q0 88 56 155.5T440-202v80Zm80 0v-80q87-16 143.5-83T720-440q0-100-70-170t-170-70h-3l44 44-56 56-140-140 140-140 56 56-44 44h3q134 0 227 93t93 227q0 121-79.5 211.5T520-122Z"],
    },
    rumble: {
        d: ['M23.3 19.5c1.2-.95 1.2-2.8 0-3.78a27.45 27.45 0 0 0-5.58-3.59c-1.38-.66-2.92.26-3.14 1.83-.34 2.4-.4 4.82-.18 7.12.15 1.59 1.67 2.54 3.07 1.93a25.4 25.4 0 0 0 5.83-3.5Zm8.97-6.99a7.57 7.57 0 0 1 .02 10.19 33.84 33.84 0 0 1-16.96 10.13 6.62 6.62 0 0 1-7.98-4.63c-1.97-6.73-1.68-14.34.22-21.1 1-3.55 4.34-5.78 7.78-4.96 6.37 1.52 12.35 5.43 16.92 10.37Z'],
        viewBox: '0 0 36 36',
    },
    search: {
        d: ["M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"],
    },
    unfold_more: {
        d: ['M480-120 300-300l58-58 122 122 122-122 58 58-180 180ZM358-598l-58-58 180-180 180 180-58 58-122-122-122 122Z'],
    },
    upload_file: {
        d: ["M452-234h52v-197l85 85 34-33-145-145-145 145 33 34 86-86v197ZM268-100q-36.725 0-61.363-24.637Q182-149.275 182-186v-588q0-36.725 24.637-61.362Q231.275-860 268-860h306l204 203v471q0 36.725-24.638 61.363Q728.725-100 692-100H268Zm280-530v-176H268q-12 0-22 10t-10 22v588q0 12 10 22t22 10h424q12 0 22-10t10-22v-444H548ZM236-806v176-176 652-652Z"],
    },
    volume_mute: {
        d: ['M792-56 671-177q-25 16-53 27.5T560-131v-82q14-5 27.5-10t25.5-12L480-368v208L280-360H120v-240h128L56-792l56-56 736 736-56 56Zm-8-232-58-58q17-31 25.5-65t8.5-70q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 53-14.5 102T784-288ZM650-422l-90-90v-130q47 22 73.5 66t26.5 96q0 15-2.5 29.5T650-422ZM480-592 376-696l104-104v208Zm-80 238v-94l-72-72H200v80h114l86 86Zm-36-130Z']
    },
    volume_up: {
        d: ['M560-131v-82q90-26 145-100t55-168q0-94-55-168T560-749v-82q124 28 202 125.5T840-481q0 127-78 224.5T560-131ZM120-360v-240h160l200-200v640L280-360H120Zm440 40v-322q47 22 73.5 66t26.5 96q0 51-26.5 94.5T560-320ZM400-606l-86 86H200v80h114l86 86v-252ZM300-480Z']
    },
    not_started: {
        d: ['M27.9704 3.12324C27.6411 1.89323 26.6745 0.926623 25.4445 0.597366C23.2173 2.24288e-07 14.2827 0 14.2827 0C14.2827 0 5.34807 2.24288e-07 3.12088 0.597366C1.89323 0.926623 0.924271 1.89323 0.595014 3.12324C-2.8036e-07 5.35042 0 10 0 10C0 10 -1.57002e-06 14.6496 0.597364 16.8768C0.926621 18.1068 1.89323 19.0734 3.12324 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6769 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9704 3.12324Z'],
    },
};