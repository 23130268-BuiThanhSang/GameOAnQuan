package oanquan;

public class BoardMapper {
    public static String getTileName(int index) {
        if (index == 5) return "quan-right";
        if (index == 11) return "quan-left";
        if (index >= 0 && index <= 4) return "dan-" + (index + 1);
        if (index >= 6 && index <= 10) return "dan-" + (index + 1);
        return "unknown";
    }
}