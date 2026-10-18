import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
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
import Colors from "@/constants/Colors";
import {
  getSubjectSections,
  gradeOptions,
  locationOptions,
  mediumOptions,
} from "@/constants/filterOptions";
import { useUIStore } from "@/store/uiStore";

type FilterKey = "grade" | "subject" | "medium" | "location";

type FilterBarProps = {
  showLocation?: boolean;
};

type SheetState = {
  key: FilterKey;
  title: string;
} | null;

type AnchorLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const labels: Record<FilterKey, string> = {
  grade: "Grade",
  subject: "Subject",
  medium: "Medium",
  location: "Location",
};

const DROPDOWN_GAP = 6;
const SCREEN_EDGE_PADDING = 12;

export function FilterBar({ showLocation = false }: FilterBarProps) {
  const scheme = useColorScheme();
  const palette = Colors[scheme];
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const filters = useUIStore((state) => state.filters);
  const searchOpen = useUIStore((state) => state.searchOpen);
  const setFilters = useUIStore((state) => state.setFilters);
  const clearFilters = useUIStore((state) => state.clearFilters);
  const setSearchOpen = useUIStore((state) => state.setSearchOpen);

  const [sheet, setSheet] = useState<SheetState>(null);
  const [searchDraft, setSearchDraft] = useState(filters.search ?? "");
  const [anchor, setAnchor] = useState<AnchorLayout | null>(null);
  const pillRefs = useRef<Partial<Record<FilterKey, View | null>>>({});

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

  const closeDropdown = () => {
    setSheet(null);
    setAnchor(null);
  };

  const openSheet = (key: FilterKey) => {
    if (key === "subject" && !filters.grade) return;
    const ref = pillRefs.current[key];
    if (ref) {
      ref.measureInWindow((x, y, width, height) => {
        setAnchor({ x, y, width, height });
        setSheet({ key, title: labels[key] });
      });
    }
  };

  const renderPill = (key: FilterKey, disabled = false) => {
    const value = filters[key];
    const isActive = Boolean(value);
    const isOpen = sheet?.key === key;
    const label = value ?? labels[key];

    return (
      <Pressable
        key={key}
        ref={(ref: View | null) => {
          pillRefs.current[key] = ref;
        }}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Filter by ${labels[key]}`}
        onPress={() => openSheet(key)}
        style={[
          styles.pill,
          disabled && styles.pillDisabled,
          {
            backgroundColor: isActive ? palette.foreground : palette.card,
            borderColor: isActive
              ? "transparent"
              : isOpen
                ? palette.hoverBorder
                : palette.border,
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
    closeDropdown();
  };

  const clearFilterKey = (key: FilterKey) => {
    setFilters({ [key]: undefined });
    closeDropdown();
  };

  /* ── Dropdown position calculation ──────────────── */
  const getDropdownPosition = () => {
    if (!anchor) return {};

    const dropdownWidth = sheet?.key === "subject" ? 260 : 220;
    const top = anchor.y + anchor.height + DROPDOWN_GAP;
    const availableBelow = screenHeight - top - SCREEN_EDGE_PADDING;

    let left = anchor.x;
    if (left + dropdownWidth > screenWidth - SCREEN_EDGE_PADDING) {
      left = screenWidth - dropdownWidth - SCREEN_EDGE_PADDING;
    }
    if (left < SCREEN_EDGE_PADDING) left = SCREEN_EDGE_PADDING;

    return {
      position: "absolute" as const,
      top,
      left,
      width: dropdownWidth,
      maxHeight: Math.min(availableBelow, screenHeight * 0.5),
    };
  };

  /* ── Render a single dropdown menu item ─────────── */
  const renderMenuItem = (
    label: string,
    isSelected: boolean,
    onPress: () => void,
    muted = false,
  ) => (
    <Pressable
      key={label}
      onPress={onPress}
      accessibilityRole="menuitem"
      style={({ pressed }) => [
        styles.menuItem,
        isSelected && { backgroundColor: palette.subtleBg },
        pressed && { opacity: 0.65 },
      ]}
    >
      <Text
        style={[
          styles.menuItemText,
          { color: muted ? palette.muted : palette.text },
          isSelected && styles.menuItemTextSelected,
        ]}
      >
        {label}
      </Text>
      {isSelected ? (
        <SymbolView
          name={{ ios: "checkmark", android: "check", web: "check" }}
          tintColor={palette.foreground}
          size={14}
        />
      ) : null}
    </Pressable>
  );

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

      {/* ── Floating dropdown popover ─────────────── */}
      <Modal
        visible={sheet !== null}
        transparent
        animationType="fade"
        onRequestClose={closeDropdown}
        statusBarTranslucent
      >
        <Pressable
          style={styles.backdrop}
          onPress={closeDropdown}
          accessibilityRole="button"
          accessibilityLabel="Close filter picker"
        />
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: palette.background,
              borderColor: palette.border,
            },
            getDropdownPosition(),
          ]}
        >
          <ScrollView
            contentContainerStyle={styles.dropdownContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {sheet?.key === "subject" ? (
              <>
                {/* Clear selection */}
                {filters.subject
                  ? renderMenuItem(
                      "Any subject",
                      false,
                      () => clearFilterKey("subject"),
                      true,
                    )
                  : null}

                {getSubjectSections(filters.grade).map((section, idx) => (
                  <View key={section.title}>
                    {(idx > 0 || filters.subject) && (
                      <View
                        style={[
                          styles.separator,
                          { backgroundColor: palette.border },
                        ]}
                      />
                    )}
                    <View style={styles.sectionHeader}>
                      <Text
                        style={[styles.sectionTitle, { color: palette.muted }]}
                      >
                        {section.title}
                      </Text>
                    </View>
                    {section.subjects.map((subject) =>
                      renderMenuItem(
                        subject,
                        filters.subject === subject,
                        () => selectValue("subject", subject),
                      ),
                    )}
                  </View>
                ))}
              </>
            ) : (
              <>
                {/* "Any" clear option */}
                {sheet && filters[sheet.key]
                  ? renderMenuItem(
                      `Any ${labels[sheet.key].toLowerCase()}`,
                      false,
                      () => clearFilterKey(sheet.key),
                      true,
                    )
                  : null}

                {sheet && filters[sheet.key] && sheetOptions().length > 0 && (
                  <View
                    style={[
                      styles.separator,
                      { backgroundColor: palette.border },
                    ]}
                  />
                )}

                {sheetOptions().map((option) =>
                  renderMenuItem(
                    option.label,
                    sheet ? filters[sheet.key] === option.value : false,
                    () => sheet && selectValue(sheet.key, option.value!),
                  ),
                )}
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

  /* ── Floating dropdown ──────────────────────────── */
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "transparent",
  },
  dropdown: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  dropdownContent: {
    paddingVertical: 6,
  },

  /* ── Menu items ─────────────────────────────────── */
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "500",
    flexShrink: 1,
  },
  menuItemTextSelected: {
    fontWeight: "700",
  },

  /* ── Section headers & separators ───────────────── */
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 12,
    marginVertical: 4,
  },
});
