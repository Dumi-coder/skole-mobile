import { SymbolView } from "expo-symbols";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import { Text } from "@/components/Themed";
import { Input } from "@/components/ui/Input";
import { useColorScheme } from "@/components/useColorScheme";
import {
  getSubjectSections,
  gradeOptions,
  locationOptions,
  mediumOptions,
} from "@/constants/filterOptions";
import Colors from "@/constants/Colors";
import { useUIStore } from "@/store/uiStore";

type FilterKey = "grade" | "subject" | "medium" | "location";

type FilterBarProps = {
  showLocation?: boolean;
};

type SheetState = {
  key: FilterKey;
  title: string;
} | null;

const labels: Record<FilterKey, string> = {
  grade: "Grade",
  subject: "Subject",
  medium: "Medium",
  location: "Location",
};

export function FilterBar({ showLocation = false }: FilterBarProps) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];
  const { height } = useWindowDimensions();
  const filters = useUIStore((state) => state.filters);
  const searchOpen = useUIStore((state) => state.searchOpen);
  const setFilters = useUIStore((state) => state.setFilters);
  const clearFilters = useUIStore((state) => state.clearFilters);
  const setSearchOpen = useUIStore((state) => state.setSearchOpen);

  const [sheet, setSheet] = useState<SheetState>(null);
  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");

  const [prevSearch, setPrevSearch] = useState(filters.search);
  if (prevSearch !== filters.search) {
    setPrevSearch(filters.search);
    setSearchDraft(filters.search ?? "");
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchDraft.trim();
      setFilters({ search: trimmed || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchDraft, setFilters]);

  const hasActiveFilters = Boolean(
    filters.grade ||
      filters.subject ||
      filters.medium ||
      filters.location ||
      filters.search,
  );

  const openSheet = (key: FilterKey) => {
    if (key === "subject" && !filters.grade) return;
    setSheet({ key, title: labels[key] });
  };

  const renderPill = (key: FilterKey, disabled = false) => {
    const value = filters[key];
    const isActive = Boolean(value);
    const label = value ?? labels[key];

    return (
      <Pressable
        key={key}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Filter by ${labels[key]}`}
        onPress={() => openSheet(key)}
        style={[
          styles.pill,
          disabled && styles.pillDisabled,
          {
            backgroundColor: isActive ? palette.foreground : palette.card,
            borderColor: isActive ? "transparent" : palette.border,
          },
        ]}
      >
        <Text
          style={[
            styles.pillText,
            { color: isActive ? palette.onForeground : palette.muted },
          ]}
        >
          {label}
        </Text>
        <SymbolView
          name={{
            ios: "chevron.down",
            android: "expand_more",
            web: "expand_more",
          }}
          tintColor={isActive ? palette.onForeground : palette.muted}
          size={14}
        />
      </Pressable>
    );
  };

  const sheetOptions = (): { label: string; value?: string }[] => {
    if (!sheet) return [];
    switch (sheet.key) {
      case "grade":
        return gradeOptions.map((g) => ({ label: g, value: g }));
      case "medium":
        return mediumOptions.map((m) => ({ label: m, value: m }));
      case "location":
        return locationOptions.map((l) => ({ label: l, value: l }));
      case "subject":
        return [];
      default:
        return [];
    }
  };

  const selectValue = (key: FilterKey, value: string) => {
    if (key === "grade") {
      setFilters({ grade: value, subject: undefined });
    } else {
      setFilters({ [key]: value });
    }
    setSheet(null);
  };

  const clearFilterKey = (key: FilterKey) => {
    setFilters({ [key]: undefined });
    setSheet(null);
  };

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={searchOpen ? "Hide search" : "Show search"}
          onPress={() => setSearchOpen(!searchOpen)}
          style={[
            styles.iconPill,
            {
              backgroundColor: searchOpen ? palette.foreground : palette.card,
              borderColor: searchOpen ? "transparent" : palette.border,
            },
          ]}
        >
          <SymbolView
            name={{ ios: "magnifyingglass", android: "search", web: "search" }}
            tintColor={searchOpen ? palette.onForeground : palette.muted}
            size={18}
          />
        </Pressable>

        {renderPill("grade")}
        {renderPill("subject", !filters.grade)}
        {renderPill("medium")}
        {showLocation ? renderPill("location") : null}

        {hasActiveFilters ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear all filters"
            onPress={() => clearFilters()}
            style={[
              styles.iconPill,
              {
                borderColor: palette.border,
                backgroundColor: palette.subtleBg,
              },
            ]}
          >
            <SymbolView
              name={{ ios: "xmark", android: "close", web: "close" }}
              tintColor={palette.text}
              size={16}
            />
          </Pressable>
        ) : null}
      </ScrollView>

      {searchOpen ? (
        <View style={styles.searchWrap}>
          <Input
            value={searchDraft}
            onChangeText={setSearchDraft}
            placeholder="Search teachers..."
            accessibilityLabel="Search teachers"
          />
        </View>
      ) : null}

      <Modal
        visible={sheet !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSheet(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setSheet(null)} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: palette.background,
              borderColor: palette.border,
              maxHeight: height * 0.5,
            },
          ]}
        >
          <View style={[styles.sheetHeader, { borderBottomColor: palette.border }]}>
            <Text style={styles.sheetTitle}>{sheet?.title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close filter picker"
              onPress={() => setSheet(null)}
              hitSlop={8}
            >
              <SymbolView
                name={{ ios: "xmark", android: "close", web: "close" }}
                tintColor={palette.text}
                size={18}
              />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.sheetContent}>
            {sheet?.key === "subject" ? (
              getSubjectSections(filters.grade).map((section) => (
                <View key={section.title} style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: palette.muted }]}>
                    {section.title}
                  </Text>
                  {section.subjects.map((subject) => (
                    <Pressable
                      key={subject}
                      onPress={() => selectValue("subject", subject)}
                      style={[
                        styles.sheetOption,
                        { borderColor: palette.border },
                      ]}
                    >
                      <Text style={styles.optionText}>{subject}</Text>
                    </Pressable>
                  ))}
                </View>
              ))
            ) : (
              <>
                {sheet ? (
                  <Pressable
                    onPress={() => clearFilterKey(sheet.key)}
                    style={[styles.sheetOption, { borderColor: palette.border }]}
                  >
                    <Text style={[styles.optionText, { color: palette.muted }]}>
                      Any {labels[sheet.key].toLowerCase()}
                    </Text>
                  </Pressable>
                ) : null}
                {sheetOptions().map((option) => (
                  <Pressable
                    key={option.label}
                    onPress={() =>
                      sheet && selectValue(sheet.key, option.value!)
                    }
                    style={[styles.sheetOption, { borderColor: palette.border }]}
                  >
                    <Text style={styles.optionText}>{option.label}</Text>
                  </Pressable>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 8,
  },
  pill: {
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pillDisabled: {
    opacity: 0.45,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
  },
  iconPill: {
    minWidth: 44,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  searchWrap: {
    marginBottom: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  sheetContent: {
    padding: 16,
    gap: 8,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  sheetOption: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
