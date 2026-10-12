---
title: "react-hook-form과 MUI Select"
concept: "React Hook Form"
summary: "react-hook-form의 Controller로 MUI Select 같은 외부 UI 컴포넌트를 연결하고, 빈 값·placeholder·수정 폼 초기값을 다루는 방법."
tags: ["react", "form", "mui", "state", "frontend"]
source: notion
date: "2026-10-12"
sources: ["https://riverkim.kr/163", "https://riverkim.kr/160"]
---

**react-hook-form**은 입력값을 React state 대신 ref와 내부 스토어로 관리해, 입력할 때마다 폼 전체가 리렌더링되지 않게 해 주는 폼 라이브러리다. 기본 `<input>`은 `register`로 바로 연결하지만, MUI `Select`처럼 자체적으로 값을 다루는 **제어 컴포넌트**는 `Controller`로 감싸서 연결한다. 제어 컴포넌트의 개념은 [폼과 제어 컴포넌트](/knowledge/dictionary/frontend/react/forms) 참고.

## Controller로 MUI Select 연결하기

`Controller`의 `render`가 넘겨주는 `field`(`value`, `onChange`, `onBlur`, `name`, `ref`)를 컴포넌트에 펼쳐 주면 된다.

```tsx
const orgTypeOptions = [
  { label: "전체", value: "all" },
  { label: "유치원", value: "kindergarten" },
  { label: "대학교", value: "university" },
  { label: "기타", value: "etc" },
]

<Controller
  name="orgType"
  control={control}
  render={({ field }) => (
    <FormControl>
      <InputLabel id="org-type-label">{placeholder}</InputLabel>
      <Select
        {...field}
        labelId="org-type-label"
        label={placeholder}
        renderValue={(value) =>
          orgTypeOptions.find((option) => option.value === value)?.label ?? placeholder
        }
      >
        {orgTypeOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )}
/>
```

- `renderValue`는 선택된 값 대신 화면에 보여 줄 내용을 정한다. 옵션 배열에서 `find()`로 현재 값과 일치하는 항목을 찾아 label을 보여 준다.
- `key`는 값 자체가 고유하다면 그대로 쓴다. 인덱스를 섞을 필요는 없다.

## 문제: 빈 문자열 값은 "선택 안 됨"으로 취급된다

'전체'를 뜻하는 옵션에 `value=""`를 주면, MUI `Select`는 빈 문자열을 **값이 없는 상태**로 본다. 그래서 '전체'를 골라도 `renderValue`가 호출되지 않고 아무것도 표시되지 않는다.

**해결**: '전체'에 `"all"` 같은 실제 값을 주고, API를 호출할 때만 빈 문자열로 바꾼다.

```ts
const orgTypeParam = orgType === "all" ? "" : orgType

const { data } = useQuery({
  queryKey: ["org", "list", page, keyword, orgTypeParam],
  queryFn: () => getOrgList({ page, keyword, orgType: orgTypeParam }),
})
```

> 다른 방법: `Select`에 `displayEmpty`를 주면 값이 비어 있어도 `renderValue`가 호출된다. 빈 값을 그대로 유지해야 한다면 이쪽을 쓴다.

## 값이 없을 때 placeholder 보여 주기

```tsx
<Select
  {...field}
  displayEmpty
  renderValue={(value) => (value ? value : placeholder)}
>
  <MenuItem value="option1">옵션1</MenuItem>
  <MenuItem value="option2">옵션2</MenuItem>
</Select>
```

`displayEmpty` 덕분에 값이 없는 초기 상태에서도 placeholder가 그려진다.

## 등록·수정 폼 같이 쓰기: setValue와 reset

등록과 수정을 같은 폼 컴포넌트로 처리할 때, 수정 모드에서는 상세 데이터를 불러온 뒤 필드를 채운다.

```ts
useEffect(() => {
  if (!detail) return
  // 필드 하나씩
  setValue("orgType", detail.orgType)
  // 또는 한 번에 (기본값까지 갱신되어 isDirty 판단이 정확해진다)
  reset({ name: detail.name, orgType: detail.orgType })
}, [detail, setValue, reset])
```

`setValue`는 값을 바꿔도 기본적으로 리렌더링을 일으키지 않는다. 다음 경우에만 폼 상태 구독자가 다시 렌더링된다.

- 값을 바꾸면서 에러가 생기거나 해소될 때(검증이 켜져 있을 때)
- 처음으로 폼이 dirty 상태(`isDirty: true`)가 될 때

`setValue(name, value, { shouldValidate: true, shouldDirty: true })`처럼 옵션으로 검증·dirty 처리를 함께 요청할 수 있다.

## 핵심 정리

- 외부 UI 컴포넌트는 `Controller` + `field` 펼치기로 연결한다.
- MUI `Select`는 빈 문자열을 "값 없음"으로 본다. '전체'에는 `"all"` 같은 값을 주고 요청 직전에 변환하거나, `displayEmpty`를 쓴다.
- 수정 폼 초기값은 `reset`(여러 필드·기본값 갱신) 또는 `setValue`(한 필드)로 채운다.

## 참고 자료

react-hook-form을 왜 고르는지(입력마다 리렌더링하지 않는 비제어 방식, 적은 코드량)는 실제 도입기를 읽어 보면 감이 온다.

- 인프랩, 「[react-hook-form을 선택한 이유와 적용 과정](https://tech.inflab.com/202207-rallit-form-refactoring/react-hook-form/)」(2022)
- 딜리셔스, 「[깔끔한 폼 개발과 정시퇴근을 위하여 react-hook-form](https://dealicious-inc.github.io/2022/07/25/ss-studio.html)」(2022)
